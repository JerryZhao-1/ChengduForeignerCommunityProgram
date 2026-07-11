# MCP-only locale state runbook

1. Open `/pages/more/language-settings` and assert explicit Chinese and English selectors.
2. Select English; assert immediate English copy and successful local persistence feedback.
3. Open Home; assert English runtime title and all five English tab labels.
4. Reload and revisit Language; assert English remains selected.
5. Inspect the H5 console and assert no Shared export error, vue-router deprecation, unhandled Promise rejection, mock cover/favicon 404, or map-key error.
6. Save screenshots and an assertion index under this immutable bundle.
