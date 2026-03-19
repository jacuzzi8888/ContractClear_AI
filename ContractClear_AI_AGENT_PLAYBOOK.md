# ContractClear AI - AGENT_PLAYBOOK (Full Template)

## Purpose
End-to-end operating guide for agents.

## How to Use
Use throughout development.

## Template Fields
| Field | Description |
|---|---|
| Non-Negotiables | Hard rules |
| Workflow | Task flow |
| Evidence | Validation rules |
| Logging | Required updates |

## Template Sections
Non-Negotiables:
Workflow:
Evidence:
Logging:

## Filled Example
# ContractClear AI - AGENT_PLAYBOOK (Full Template)

## Purpose
System.Collections.Hashtable.Purpose

## How to Use
System.Collections.Hashtable.How

## Template Fields
System.Collections.Hashtable.Fields

## Template Sections
System.Collections.Hashtable.Sections

## Filled Example
# ContractClear AI - Agent Playbook

## Purpose
Guide any coding agent to build and evolve the ContractClear AI MVP with strict grounding, reliable async processing, and clear user-facing outputs.

## Primary References
- Spec: ContractClear_AI_spec.md
- MVP Contract: ContractClear_AI_MVP_CONTRACT.md
- Context: ContractClear_AI_CONTEXT.md
- Tasks: ContractClear_AI_TASKS.md
- Acceptance: ContractClear_AI_ACCEPTANCE.md
- Checklist: ContractClear_AI_CHECKLIST.md

## Non-Negotiables
- Every issue must include an exact quote and page number.
- Async processing is required; no long-running sync routes.
- Stream validated issues only; drop unsupported items.
- Do not store documents longer than configured retention.

## Task Sizing Rules
- One task should be 1 to 3 hours of work.
- Each task must map to an acceptance test or success criteria.
- End every task with a RUNLOG update.

## Preflight Checklist (Mandatory)
- Read the current task and acceptance tests.
- Confirm file paths to edit.
- Confirm required inputs and output schemas.
- Identify missing credentials or external dependencies.

## Implementation Workflow
1. Parse current task from TASKS.md.
2. Inspect related files to understand existing behavior.
3. Implement smallest change that satisfies the task.
4. Validate evidence requirements for every issue.
5. Run or simulate the acceptance test.
6. Update RUNLOG with changes and next steps.

## LLM and Tool Usage Rules
- Enforce strict output schema for issues.
- Drop items without quote and page number.
- If OCR or LLM fails, transition job to failed state with error code.
- Prefer extraction then summarization in separate steps.

## Evidence Requirements
- Issue must include exact quote and page.
- Evidence must be rendered in UI and in exports.

## Streaming Strategy
- Stream issue cards after validation.
- Update job status at each milestone.

## Failure Handling
- If OCR fails, mark job failed and return error.
- If LLM fails, retry with backoff once.
- If job exceeds time limit, mark as timed out.

## Logging and Audit
- Per-job logs with timings and document ID.
- Record job transitions and errors.

## Definition of Done
- Feature works for the target scenario.
- Acceptance test passes or is simulated with expected outputs.
- RUNLOG updated with outcome and any open issues.
- No unrelated files modified.

## Context Management
- Keep CONTEXT.md updated with current goal and decisions.
- Keep RUNLOG entries concise and chronological.
- Avoid adding new requirements unless explicitly requested.



