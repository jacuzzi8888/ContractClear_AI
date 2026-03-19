# ContractClear AI - ACCEPTANCE (Full Template)

## Purpose
Define acceptance criteria for ContractClear AI.

## How to Use
Use for validation and demo readiness.

## Template Fields
| Field | Description |
|---|---|
| Test | ID and name |
| Preconditions | Setup |
| Steps | Actions |
| Expected | Result |

## Template Sections
Test ID:
Preconditions:
Steps:
Expected:

## Filled Example
# ContractClear AI - ACCEPTANCE (Full Template)

## Purpose
System.Collections.Hashtable.Purpose

## How to Use
System.Collections.Hashtable.How

## Template Fields
System.Collections.Hashtable.Fields

## Template Sections
System.Collections.Hashtable.Sections

## Filled Example
# ContractClear AI - Acceptance Tests (Detailed)

Test 1
- Preconditions: Valid user session, 40-page PDF.
- Steps: Upload PDF and create job.
- Expected: Job starts and first issue appears within 40 seconds.

Test 2
- Preconditions: Scanned PDF with no extractable text.
- Steps: Upload PDF and create job.
- Expected: OCR path is used and issues still include quotes and pages.

Test 3
- Preconditions: LLM returns issue without evidence.
- Steps: Process PDF.
- Expected: Issue is dropped and not displayed.

Test 4
- Preconditions: LLM call fails due to network error.
- Steps: Process PDF.
- Expected: Job transitions to failed with error code and retry option.

Test 5
- Preconditions: User requests export.
- Steps: Export report after processing.
- Expected: Report matches visible issues and evidence.



