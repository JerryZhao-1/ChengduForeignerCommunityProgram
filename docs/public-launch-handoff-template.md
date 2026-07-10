# 公开发布交接模板

变更：`production-public-launch-closure`

## 如何使用

1. 复制本模板生成一次具体交接记录，或直接在最终 handoff 中填入对应证据链接。
2. `Decision state` 只能选择一个英文值，不能多选。
3. 所有 blocker 都必须写 blocker owner、下一步动作和证据要求。
4. 早期 `production-readiness-acceptance` 只能作为 historical or production-like evidence，不能替代公开发布证据。

Decision state: <select exactly one>

- `blocked`
- `ready for WeChat review upload`
- `ready for review submission`
- `ready for phased release`
- `ready for full public release`

## 选定目标

- CloudBase env id：
- CloudBase function name：
- API route：
- Hosted Admin URL：
- Mini Program app id：
- Public-review package path：

## evidence links

| Evidence class | Required link or path | Result | blocker owner | Notes |
| --- | --- | --- | --- | --- |
| Ownership matrix |  |  |  |  |
| Source typecheck/test/lint/build gate |  |  | Codex worker |  |
| Mini Program public-review artifact scan |  |  | Codex worker |  |
| Hosted Admin target scan |  |  | Codex worker |  |
| Admin auth without mock actor headers |  |  | CloudBase operator / Admin operator |  |
| CloudBase target and console readiness |  |  | CloudBase operator |  |
| WeChat account certification, filing, service category |  |  | WeChat account owner |  |
| Privacy disclosures |  |  | WeChat account owner |  |
| request/upload/download/media domains |  |  | WeChat account owner |  |
| iOS true-device matrix |  |  | QA operator |  |
| Android true-device matrix |  |  | QA operator |  |
| Content/media audit |  |  | Codex worker / content owner |  |
| Review upload/submission |  |  | Release operator |  |
| Rollback readiness |  |  | Release operator |  |
| Monitoring readiness |  |  | Release operator / CloudBase operator |  |

## Blockers

| Blocker | blocker owner | Severity | Blocks decision state | Next action | Evidence needed |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## 历史证据分类

Prior `production-readiness-acceptance` evidence may be referenced only as historical or production-like evidence. It does not replace public-launch evidence for true-device checks, account-owner domain confirmation, production Admin auth, production content audit, WeChat review submission, or release approval.

| Historical or production-like evidence | Public-launch evidence that supersedes or complements it |
| --- | --- |
| `auto_test_openspec/production-readiness-acceptance/...` |  |

## 回滚与监控

- Previous known-good version：
- Rollback operator：
- Withdraw/pause/rollback path：
- CloudBase log owner：
- Admin smoke owner：
- Mini Program smoke owner：
- Incident requestId capture path：
