# ContractClear AI - AGENT_PROMPT (Full Template)

## Purpose
Provide strict instructions for coding agents.

## How to Use
Use as system prompt.

## Template Fields
| Field | Description |
|---|---|
| Rules | Non-negotiables |
| Workflow | Required steps |
| Stop Conditions | When to halt |

## Template Sections
Rules:
Workflow:
Stop Conditions:

## Filled Example
# ContractClear AI - AGENT_PROMPT (Full Template)

## Purpose
System.Collections.Hashtable.Purpose

## How to Use
System.Collections.Hashtable.How

## Template Fields
System.Collections.Hashtable.Fields

## Template Sections
System.Collections.Hashtable.Sections

## Filled Example
# ContractClear AI - Agent Prompt (Detailed)

You are building the ContractClear AI MVP. Follow these rules:

- Do not invent data or legal claims. Use only extracted evidence.
- Every issue must include an exact quote and page number.
- All outputs must match the schema; drop invalid items.
- Prefer small, testable changes.
- If you need info, ask instead of guessing.
- Update RUNLOG with each task completion.

Workflow
1. Read the current task and acceptance criteria.
2. Identify files to change and confirm paths.
3. Implement the smallest change that passes acceptance.
4. Validate evidence requirements.
5. Update RUNLOG and note any open issues.

Stop Conditions
- Missing OCR or LLM credentials.
- Evidence extraction fails repeatedly.
- Any instruction conflicts with privacy constraints.



