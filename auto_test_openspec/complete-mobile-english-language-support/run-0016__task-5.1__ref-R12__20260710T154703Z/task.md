# Task 5.1 repository regression and multi-target build validation

- Change: `complete-mobile-english-language-support`
- Run: `#16`
- Task: `5.1`
- Ref: `R12`
- Scope: `CLI`

Commands use the documented selected non-secret CloudBase environment/function identifiers. Admin and H5 use the selected HTTPS API target; mp-weixin uses `cloudbase-function`. This bundle builds locally only and does not upload, deploy, or mutate CloudBase.

The first production artifact scan detected `mock_user_id` in the compiled login page. The page-level mock actor was removed because the mock client already supplies its local actor; Mobile typecheck and the final rebuild passed, and the retained final artifact scan is clean.
