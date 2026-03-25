# Plan: Bulk Delete Extraction History on Data & Privacy Page

## Context

Users can only delete data by deleting their entire account. There's no way to selectively clear extraction history. This adds a bulk select + delete system to the Data & Privacy settings page.

## Data Model

```
documents (id, owner_id, file_name, status, created_at)
  └── jobs (id, document_id, status, issue_count)
        └── issues (id, job_id, risk_level, ...)
```

Deletion must cascade: issues → jobs → documents (same pattern as existing `handleDelete`).

## Implementation

### File: `app/src/app/dashboard/settings/data/page.tsx`

#### 1. Add state for selection

```tsx
const [historyDocs, setHistoryDocs] = useState<any[]>([]);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [deletingHistory, setDeletingHistory] = useState(false);
const [showHistoryConfirm, setShowHistoryConfirm] = useState(false);
```

#### 2. Fetch documents in existing `useEffect`

Add to the existing `init()` function (after fetching stats):
```tsx
const { data: docs } = await supabase
  .from("documents")
  .select("id, file_name, status, created_at, jobs(id, issue_count)")
  .order("created_at", { ascending: false });
if (docs) setHistoryDocs(docs);
```

#### 3. Add selection helpers

```tsx
const allSelected = historyDocs.length > 0 && selectedIds.size === historyDocs.length;
const toggleSelectAll = () => {
  if (allSelected) setSelectedIds(new Set());
  else setSelectedIds(new Set(historyDocs.map(d => d.id)));
};
const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};
```

#### 4. Add bulk delete handler

```tsx
const handleBulkDelete = async () => {
  if (selectedIds.size === 0) return;
  setDeletingHistory(true);
  try {
    for (const docId of selectedIds) {
      const { data: jobs } = await supabase.from("jobs").select("id").eq("document_id", docId);
      if (jobs) {
        for (const job of jobs) {
          await supabase.from("issues").delete().eq("job_id", job.id);
        }
      }
      await supabase.from("jobs").delete().eq("document_id", docId);
      await supabase.from("documents").delete().eq("id", docId);
    }
    // Refresh
    setHistoryDocs(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    setShowHistoryConfirm(false);
    // Refresh stats
    const { count: docs } = await supabase.from("documents").select("*", { count: "exact", head: true });
    const { count: jobs } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { count: issues } = await supabase.from("issues").select("*", { count: "exact", head: true });
    setStats({ docs: docs || 0, jobs: jobs || 0, issues: issues || 0 });
  } catch (err) {
    console.error("Bulk delete failed:", err);
  } finally {
    setDeletingHistory(false);
  }
};
```

#### 5. Add UI section (between Data Overview and Export)

New section with:
- Header with icon + title "Extraction History"
- Select All checkbox row
- Scrollable list of documents with checkboxes
- Each item shows: checkbox, file name, date, status badge, issue count
- "Delete Selected" button (enabled when `selectedIds.size > 0`)
- Confirmation modal when clicked
- Empty state when no documents

#### 6. Responsive considerations

- List scrolls vertically with `max-h-[400px] overflow-y-auto`
- On mobile: checkbox + file name on one line, date/status on second line
- Delete button stacks below on mobile

## Verification

1. Navigate to `/dashboard/settings/data`
2. See "Extraction History" section with all documents listed
3. Check individual items → "Delete Selected" button enables
4. Click "Select All" → all items checked
5. Click "Delete Selected" → confirm dialog appears
6. Confirm → items deleted, stats refresh, list updates
7. Build passes: `npm run build`
