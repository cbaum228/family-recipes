# Optional private Google Drive synchronization — design

**Status:** Proposed; **not connected**. The publicly hosted GitHub Pages cookbook currently saves inventory and meal plans in each browser's local storage. A Google Drive integration must be implemented and authorized separately.

## Intended architecture
- Public GitHub repository and Pages host only recipes and client-side app code. Household data is never committed.
- A single private `family-recipes-household.json` file lives in a normal (user-visible) Google Drive folder. It is shared **with specific household Google accounts as editors**, not by a public link.
- Each household member signs into the cookbook using their own Google account and grants per-file access with Google Identity Services and the Google Picker/Drive API (`drive.file` scope).
- The local browser is a cache for offline use, while Drive holds the shared pantry lots, meal plan, and cooked history.
- Synchronize on app open, on page focus, and periodically while the app is open; write updates after edits. A closed website cannot reliably receive live push changes without extra infrastructure.
- Each lot and plan entry needs a stable ID and last-modified metadata. Load/merge changes from both devices rather than overwriting one another. Handle deletes with tombstones and track remote revision, show a clear sync/conflict status. Backups remain exportable.
- Use offline-first changes and retry after reconnecting; expose an explicit 'Sync now' action.
- Never embed Google OAuth client **secrets**, access tokens, private file content, or email addresses in the public repository. A public browser OAuth *client ID* is not a secret.
- Google Drive `appDataFolder` **cannot** be shared with other users, so use a normal shared Drive file.

## Configuration required to implement
1. Google Cloud project with Drive API and Google Picker API enabled.
2. OAuth consent screen for the intended users; browser OAuth client configured for the GitHub Pages origin (plus each friend's origin if forked).
3. A private file in Drive shared with both users; authorize it separately for each user through Picker.
4. App implementation and live two-device sync tests, including simultaneous edits and network interruptions.

## Alternatives
If the app grows beyond a couple of household members, consider a small managed database with per-household authorization (for example Supabase with Row Level Security). This avoids whole-file write conflicts and supports real-time subscriptions, while keeping GitHub Pages hosting and Markdown recipes unchanged.

The goal is a plug-in sync adapter, not a second private GitHub Pages repository. Forks remain useful without requiring Drive setup: local-only operation should always be available.
