# H5 screenshots and route evidence

- `outputs/routes-en.json`: 27/27 English route MCP snapshots.
- `outputs/routes-zh.json`: 27/27 Chinese route MCP snapshots.
- `outputs/screenshots/home-en.png`: Home copy/actions/date formatting.
- `outputs/screenshots/event-detail-en.png`: Event formal content, labels, status and ticket path.
- `outputs/screenshots/discover-en.png`: English Discover system UI with mixed original-language UGC.
- `outputs/screenshots/place-detail-en.png`: Places formal content/category/tags/actions.
- `outputs/screenshots/me-en.png`: Me/Profile navigation and counts.
- `outputs/screenshots/language-en.png`: explicit bilingual selector and English state.
- `logs/browser-console.json`: Vite debug connection entries only; no error/warning entries.

During this run, direct-start routes initially retained a static `pages.json` title and H5 document title lagged an immediate locale switch. Both were fixed by a deferred per-page navigation refresh plus synchronized `document.title`; all 54 route snapshots were regenerated after the fix.
