---
allowed-tools: Agent, Bash, Read, Grep, Glob, Edit, Write
description: Run parallel code review across quality, tests, performance, and security dimensions on recently written code
---

Run a comprehensive code review on the changed code using 4 parallel specialist agents.

## Steps

1. First, identify the scope. If `$ARGUMENTS` is provided, use it as the file/directory scope. Otherwise, get recently changed files:
   ```bash
   git diff --name-only HEAD
   ```

2. Launch all 4 review agents **in parallel** (single message with 4 Agent tool calls):
   - **review-quality**: Check architecture layering, separation of concerns, file size, duplication, type safety. Auto-fix.
   - **review-test**: Generate unit tests for pure functions and core logic. Run tests to verify they pass.
   - **review-performance**: Check React re-renders, memory leaks, TanStack Query staleTime, N+1 queries. Auto-fix.
   - **review-security**: Check hardcoded secrets, unguarded routes, missing userId filters, XSS, exposed fields. Auto-fix.

   Pass the identified scope to each agent.

3. Collect all 4 results. Print a consolidated summary:

   ```
   ## Code Review Complete

   | Dimension   | Status  | Actions taken |
   |-------------|---------|---------------|
   | Quality     | PASS/FIX | [summary]    |
   | Tests       | PASS/FIX | [summary]    |
   | Performance | PASS/FIX | [summary]    |
   | Security    | PASS/FIX | [summary]    |

   ### Needs Manual Attention
   [Any items agents could not auto-fix]
   ```

4. After all fixes, run final validation:
   ```bash
   pnpm tsc --noEmit && pnpm test --run 2>&1 | tail -20
   ```

   Report the result. If there are failures, investigate and fix before finishing.
