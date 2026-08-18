# GitHub Code Review

Review the current DASH changes as if you are performing a GitHub pull request review.

## Goal

Identify issues that should reasonably be addressed before merging the current work.

Focus on:

* Bugs or incorrect behavior
* Regressions
* Missing or incorrect edge-case handling
* Data integrity concerns
* Security issues
* Meaningful test gaps
* Code that conflicts with existing DASH patterns or the stated intent of the change
* Required documentation updates when explicitly triggered by the commit version marker

## Review Approach

1. Understand the purpose of the current change from the branch, diff, PR description, commit history, and relevant project documentation.
2. Review the changed code and enough surrounding code to understand its behavior.
3. Trace important flows across files when necessary rather than reviewing each file in isolation.
4. Check existing tests and whether they adequately cover the behavior being changed.
5. Distinguish actual merge concerns from optional improvements.

### Documentation Trigger

Commit versions use the format `x.y.z`.

When the `x` portion is explicitly marked as the documentation-update trigger for the change, treat documentation as part of the PR scope.

In that case:

* Determine whether the change introduces or materially changes a feature, behavior, workflow, API, architecture, or other documented capability.
* Identify the existing DASH documentation that should reflect the change.
* Verify that the relevant documentation has been updated in the same PR.
* Report missing or materially stale documentation as a review finding.

Do not use this trigger as a reason to rewrite or broadly clean up unrelated documentation. Only require updates directly related to the change being reviewed.

If the documentation trigger is not present, documentation improvements may be mentioned only when they represent a concrete correctness or usability issue introduced by the current change.

## Scope Discipline

Do not expand the scope of the PR simply because adjacent code could be improved.

Do not recommend:

* Unrelated refactors
* New abstractions without a concrete need
* Architecture changes outside the current work
* Additional product functionality
* Cleanup that can reasonably remain separate

## Findings

For each finding include:

**Severity:** Critical / High / Medium / Low
**Location:** file and relevant code
**Issue:** what is wrong
**Impact:** what could happen
**Recommendation:** the smallest reasonable correction

Only report findings you can substantiate from the code.

If something is uncertain, explicitly label it as a question or risk rather than presenting it as a confirmed defect.

## Final Assessment

End with:

**Merge recommendation:** Ready / Ready with minor follow-up / Changes requested

Then briefly summarize:

* What must be fixed before merge
* What, if anything, can safely remain as follow-up work
* If the documentation trigger is present, whether the required documentation is current

If there are no meaningful issues, say so. Do not manufacture findings for the sake of producing a review.
