# MCP GUI Runbook: Profile Follow Data

Use Playwright MCP only. Do not use browser automation scripts.

## Prerequisite

Start the API separately in mock mode:

```bash
pnpm dev:api
```

Then run this bundle's `run.sh` or `run.bat` to start Mobile H5.

## Steps

1. Open `http://localhost:5174/#/pages/more/profile?id=user_001`.
2. Assert the page renders the self profile name and shows edit/share actions, not the follow button.
3. Capture `outputs/screenshots/profile-self.png`.
4. Open `http://localhost:5174/#/pages/more/profile?id=user_002`.
5. Assert the page renders Emma's profile data, post count, followers, following, and the follow button.
6. Click follow. Assert the button label changes to followed/following and follower count updates.
7. Reload the page. Assert followed state and follower count persist.
8. Click unfollow. Assert state and count return.
9. Switch to the video tab. Assert it renders a valid empty or video-post state without falling back to another user's posts.
10. Open `http://localhost:5174/#/pages/more/profile?id=user_inactive`.
11. Assert a safe unavailable profile state is shown and no stale profile data remains.
12. Capture `outputs/screenshots/profile-unavailable.png`.
13. Record console errors, if any, in `logs/console-profile.txt`.

## Assertion Points

- Profile data comes from API-backed profile endpoints.
- Follow state survives reload.
- Unavailable profiles do not render hardcoded or previously loaded profile data.
- No uncaught console error is emitted during the flow.
