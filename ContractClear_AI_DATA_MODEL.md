# ContractClear AI - DATA_MODEL (Full Template)

## Purpose
Define entities, fields, constraints, and retention for ContractClear AI.

## How to Use
Use to implement storage and validation.

## Template Fields
| Field | Description |
|---|---|
| Entity | Data object name |
| Fields | Name, type, required |
| Retention | Data lifecycle |

## Template Sections
### Issue (Example)
| Field | Type | Required | Constraints |
|---|---|---|---|
| quote | string | yes | exact clause |
| page_number | number | yes | 1-based |
| risk_level | string | yes | low/medium/high |

## Filled Example
# ContractClear AI - DATA_MODEL (Full Template)

## Purpose
System.Collections.Hashtable.Purpose

## How to Use
System.Collections.Hashtable.How

## Template Fields
System.Collections.Hashtable.Fields

## Template Sections
System.Collections.Hashtable.Sections

## Filled Example
# ContractClear AI - Data Model

## Entities
- Document: id, owner, status, file_url, page_count
- Issue: risk_level, quote, page_number, explanation, confidence
- Job: document_id, state, started_at, finished_at
- AuditLog: event, actor, timestamp, result

## Retention
- Default delete after processing; configurable.



