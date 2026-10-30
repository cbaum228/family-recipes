# Private Google Drive sync setup and behavior

**Implementation:** Optional browser-only Google Drive adapter in `assets/drive-sync.js`. It does not use a ChatGPT plugin or publish household data to GitHub. **Requires your own Google Cloud OAuth credentials and live testing before use.**

## Configure Google Cloud

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project and record its **numeric project number**.
2. Enable **Google Drive API** and **Google Picker API** in APIs & Services.
3. Configure Google Auth Platform (Branding / Audience / Data access). Use External Testing with both household Google users listed as test users until the application is published/verified as required. Add `https://www.googleapis.com/auth/drive.file` to Data access.
4. Under Clients, create an **OAuth 2.0 client → Web application**. Add authorized JavaScript origin `https://cbaum228.github.io`, without a subpath. A web JavaScript client uses a public client ID, **not** a client secret.
5. Create an API key. Restrict **API** usage to Google Picker API (also Drive API if required in your project) and **Websites/HTTP referrers** to `https://cbaum228.github.io/*` and `https://docs.google.com/*`. The docs.google.com rule is needed because Picker uses a Google-hosted iframe. A browser API key is not an authorization credential; scope/Drive file ACL still govern access to private files.
6. On the cookbook's **Drive sync** page, paste the OAuth Web Client ID, Picker API key, and numeric project number. Those values are stored in **this browser's local storage**, not in the public repo.
7. Sign in with Google. Browser token is in memory, with the limited `drive.file` scope.

## Create and share the pantry
1. Owner signs in and clicks **Create new private pantry file**. The site creates a normal JSON file called `family-recipes-household.json` under the signed-in account. It starts with the existing local pantry/plan/shopping/cooking data.
2. Click the Drive file link and share the JSON with the other adult as an **Editor**, leaving General access = **Restricted**.
3. The other adult uses the same OAuth client configuration on their phone, signs in with their Google account, clicks **Choose existing / shared file**, then selects the JSON in Google Picker. Picker explicitly authorizes the app to open the shared file for this second account.
4. On later page visits, click **Sign in to Drive** if a short-lived token is missing or expired. Browsers keep only public config, selected Drive file ID, local household cache and sync baseline.

## Data safety
- The public repository only hosts Markdown recipes, public code and interface. Private file contents and access tokens are never embedded into the site.
- Household files use normal Drive sharing permissions. A Drive file ID alone does not authorize access.
- Local pantry/plan/shopping/cooking data is cached in localStorage and exported by **Download private backup** on the Pantry page.
- Sync uses record IDs and a three-way merge with the last successful local baseline. If the same record was changed separately on two devices, sync reports a conflict and **does not intentionally upload over the conflict**.
- Before a write it re-reads the Drive file version to reduce accidental overwrites; after upload it checks the file contents. **This is not an atomic compare-and-swap**. Very closely timed writes can still cause a lost update. For strict concurrent transaction guarantees, replace this with an authenticated database backend; Drive alone cannot provide that guarantee through this implementation.
- The browser polls while open and syncs after edits; closed browser windows cannot receive live updates. Tokens expire and must be refreshed with explicit Google interaction.
- Picking an existing Drive file on a device with divergent local data requires explicit permission to replace it; the app downloads a private backup first. Files from another app or malformed JSON are rejected.
- If the connection is unavailable, edits remain local and can be synchronized upon reconnecting. If a conflict is detected, preserve backups and resolve carefully before editing further.
- Do not add Google OAuth client secrets, unrestricted API keys or Google account passwords to GitHub.

## Forking and friends
Every fork can bring its own OAuth client project and configured authorized origin. Each household creates a completely separate restricted Drive file. This optional sync feature does not limit public recipe browsing or local-only pantry operation.

## Official references
- https://developers.google.com/workspace/drive/picker/guides/web-picker
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/manage-uploads
