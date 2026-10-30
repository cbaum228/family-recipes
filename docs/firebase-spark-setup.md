# Firebase Spark private household synchronization

**Status:** Code integrated in `assets/firebase-sync.js` and cookbook interface. Live Firebase sign-in, Firestore rules, and two-device shopping updates **must be configured and tested by the project owner**. The GitHub repository does not contain Firebase credentials or private pantry data.

## 1. Create a no-cost Firebase project
1. Open [Firebase Console](https://console.firebase.google.com/) and create **Family Recipes** under **Spark (no-cost)**. You do not need a billing card for the normal Spark project setup. Google Analytics is optional.
2. Go to **Build → Authentication → Sign-in method → Google** and enable it.
3. In **Authentication → Settings → Authorized domains**, add **cbaum228.github.io**. Do not include the protocol or `/family-recipes` path.
4. Go to **Build → Firestore Database → Create database**, choose **Standard edition** and the **default** database, select a region and choose **Production mode** (rules initially deny everyone).
5. In the Firestore **Rules** tab, paste the full contents of [firebase/firestore.rules](../firebase/firestore.rules) and click **Publish**. **Never use `allow read, write: if true`**.
6. Under **Project settings → Your apps**, register a **Web app**. Copy the Firebase Web SDK config values: `apiKey`, `authDomain`, `projectId`, and `appId`. These are public identifiers, not secret keys. Do not copy Firebase Admin SDK service-account credentials or Google Cloud service-account JSON into the site.

Only one free Firestore database per project qualifies for the free tier. The Firebase Spark plan has a free allowance of 1 GiB, 50,000 document reads/day and 20,000 writes/day. Verify limits at https://firebase.google.com/pricing.

## 2. Configure cookbook on first browser
1. Open [your Family Recipes sync page](https://cbaum228.github.io/family-recipes/sync/).
2. Paste the four values from the Firebase Web SDK config (not from Google OAuth Cloud credentials) and choose **Save Firebase configuration**.
3. Select **Sign in with Google**. Approve your own Google account. The page shows the assigned Firebase **UID**.
4. Click **Create private household**. It will seed Firestore with the pantry, shopping trips and cooking history already cached in that browser.
5. Copy your **Household ID**. Save it privately with the household. The ID alone does **not** permit access, because Firestore rules require authorized membership.
6. Confirm data appears, then test editing a nonimportant pantry quantity and verifying it on another signed-in browser.

## 3. Add your spouse
1. On the second device open the same sync page and enter the same four public Firebase config values.
2. Sign in using the spouse's own Google account; copy **My Firebase UID** displayed in the page.
3. On the owner's device, paste that UID into **Authorize another user's Firebase UID** and click **Authorize household member**. Only the owner may authorize or remove members.
4. On the second device paste the **Household ID** and select **Connect to household**.
5. If the second device has local unsynchronized data, the app will **not** silently overwrite it. Export a local backup if requested, and use **Use cloud copy** only when you intend to replace that device's local state.

## 4. What synchronizes
- Pantry lots with quantities and use-by dates.
- Saved shopping checklist and purchased/unchecked status.
- Meal plans with serving amounts.
- Cooking history and actual ingredients used.

Firestore listeners deliver updates to open, authorized devices. Browser changes save immediately to local storage; an approximately 900 ms debounce groups changes, followed by a Firestore transaction. Transactions read the latest household snapshot and merge ID-based records. Changes to different records merge automatically. If both devices edit the same record differently, synchronization pauses rather than overwriting silently. Choose **Use cloud copy** only if you want to discard local-only edits after downloading a backup.

## 5. Privacy and security
- The repository and recipe website are public; the `households` Firestore collection is private.
- The published [Firestore security rules](../firebase/firestore.rules) permit `get` and `update` only for household members whose Firebase UIDs are in `memberUids`; listing households is denied. Creation is limited to an initially private household owned by the signed-in creator.
- Only the owner can change members. Unauthenticated people cannot read the pantry, even if they know the household ID or copy the app's Firebase API key.
- The public Firebase configuration is not an access token. No credentials are committed to the GitHub repository. Google access and Firestore rules enforce data security.
- Each device caches household records locally. On shared devices, browser storage should be treated as private household data; signing out of Firebase does not erase the cache. Use a separate browser profile if necessary.
- Each household currently uses one Firestore document, so this is intended for small groups. Firestore documents are limited to 1 MiB; the client warns before a large write. Realtime notifications require internet access.
- No production rule deployment or two-device end-to-end tests can be completed until you configure your own Firebase project.

## 6. Troubleshooting
- **auth/unauthorized-domain:** Add `cbaum228.github.io` to Firebase Authentication authorized domains; don't include https.
- **permission-denied:** Publish the restrictive Firestore rules, ensure the signed-in Firebase account has been added to the owner's household, and check the correct project ID.
- **Popup blocked:** Permit popups, and launch sign-in directly from the Sign in with Google button.
- **Already have local pantry:** When connecting to a different household, back it up and review whether to use the cloud copy or create a new household.
- **Conflicting edits:** Export the local JSON backup, reconcile the differences on one device, and use cloud copy on the other if appropriate.

## 7. For forks
Friends may fork this public repository, point its Jekyll `url` / `baseurl` at their own GitHub Pages, register their own Firebase project and web app, publish the same rules, and create a separate household. None of this shares their pantry with your household.

## Official docs
- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/firestore/manage-data/transactions
