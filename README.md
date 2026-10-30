# Family Recipes

Markdown-first public cookbook, built for GitHub Pages, with an offline-friendly pantry, meal planning, shopping checklists and optional private Firebase Spark synchronization.

## Open the cookbook
After GitHub Pages is enabled, visit **https://cbaum228.github.io/family-recipes/**.

## Features
- All recipe ingredient rows always display precise canonical grams/ml followed by an approximate US-unit equivalent in parentheses (lb, oz or fl oz). Both scale automatically when serving counts change; no toggle or ingredient-count estimates. MacroFactor structured recipe data and shopping arithmetic remain metric-only.
- Searchable, publicly forkable recipes in `_recipes/*.md`, separated into **planned**, **tested**, and **needs-reconstruction**.
- Per-recipe serving scaling (one serving is a full reference portion, not a household meal); use recipe link import into MacroFactor for baseline quantities or copy the scaled text into its AI importer.
- Pantry quantities and optional use-by dates in your browser. Recipe recommendations consider quantity-weighted pantry coverage, nearing use-by dates, and recent cuisine variety. No unverified macro estimates are fabricated.
- Grocery trip checklist that freezes missing items from planned recipes. Checking off a purchased item adds the actual quantity (and optional use-by date) to the pantry. Purchased items remain visible; AnyList bulk paste and CSV are optional fallbacks.
- A Cook action on every planned recipe lets you edit actual ingredient quantities, enter extras from the known ingredient catalog, record final cooked weight, and deduct pantry stock after confirmation. Cooking history retains actual ingredient amounts.
- JSON backup and import for offline records, plus optional Google sign-in and private Firestore realtime household sync.

## Privacy and limitations

**Recipes and the GitHub Pages site are public.** Pantry, shopping trips, meal plans and cooking history are kept in browser-local storage until you opt in to Firebase. In Firebase Spark mode, a single private Firestore household document synchronizes those records for specifically authorized Google accounts. [Security rules](firebase/firestore.rules) restrict data to household members; no private data or secret service-account credentials are published to GitHub.

Firebase requires your own free Spark project, Firebase Authentication Google provider, Firestore database, **published security rules**, and Web application config. It is not automatically connected. A Firebase API key identifies the app and is not the access credential protecting Firestore; authorized users and Security Rules are essential.

The local cached data remains on the device even after Google sign-out. Protect shared browser profiles, export periodic private backups, and review conflicting changes rather than forcing an overwrite. Firestore transactions provide atomic single-document updates, and the UI detects same-record conflicts. The current one-document household design is intended for small households (Firestore 1 MiB document limit).

See [Firebase Spark setup](docs/firebase-spark-setup.md). The old Google Drive adapter is no longer loaded.

## Publish

In GitHub repository **Settings → Pages**, choose **Deploy from a branch → main → /(root)**. Jekyll builds the Markdown cookbook into public HTML pages.

## Add a recipe

Copy one of the complete Markdown files in `_recipes/`. Ingredients need numeric `amount`, canonical `unit` (g or ml), `shopping_key`, `shopping_name`, and `aisle` for pantry matching and consolidated shopping lists. Mark recipes `ready-to-test` until you cook and review them.

The repository is forkable. Friends use their own Github Pages domain and their own Firebase Spark project with the same restrictive rules. No household pantry is shared just by forking recipes.

## Shopping with AnyList

The planner supports two exports. **Copy names for AnyList** produces one line per item in the form `Olive oil (25 g)`. Paste this into an existing shared grocery list via AnyList's Add Item → pasteboard option. AnyList bulk-list paste treats the full line as the item **name**, so the quantity remains visible as part of that name.

**Copy recipe ingredients (Metric)** produces ingredient lines such as `25 g Olive oil`, while **Copy recipe ingredients (US)** produces `0.88 oz Olive oil` and uses pounds for larger weights and US fluid ounces for volume. In AnyList, create a temporary recipe, paste into the recipe **Ingredients** editor, save, then choose **Add all ingredients to list** and select your existing shared grocery list. AnyList recognizes both metric and US ingredient units. These are calculated export helpers; source recipe, pantry and nutrition values stay in g/ml. Verify parsed/rounded quantities before shopping. Do not import both alternatives into the same list, or items may be duplicated.

AnyList documentation: https://help.anylist.com/articles/paste-items/ and https://help.anylist.com/articles/recipe-copy-paste/ and https://help.anylist.com/articles/add-recipe-ingredients-to-list/.

## New shopping and cooking workflow

1. Choose and scale recipes in Meal planner.
2. Click **Build / refresh shopping trip**. The shopping list freezes the missing ingredient quantities after pantry subtraction. Grocery lines remain in the list after checking them off.
3. Enter actual purchased quantity and optional use-by date, then check the item. This adds a distinct pantry lot. Unchecking removes the lot if it has not already been edited or consumed.
4. When cooking, click **Cook** beside the planned recipe. Review the default quantities, set skipped ingredients to zero, and add other ingredients from the known catalog. Optionally record finished cooked batch weight for MacroFactor. Confirm to deduct the amounts actually used and save the cooking record.
5. To share the list across devices, configure [Firebase Spark household sync](docs/firebase-spark-setup.md). Until configured, all records stay local to each browser.

Limitations: manually adding arbitrary groceries not already in a planned recipe, undoing partially consumed purchases, recipe substitutions absent from the ingredient catalog, and household synchronization needs a configured Firebase project and live testing. Pantry shortages on cooking are confirmed and recorded without allowing negative inventory.

## Private Firebase Spark household sync

See [the setup guide](docs/firebase-spark-setup.md) and [Security Rules](firebase/firestore.rules). First sign-in creates an owner identity; you create a private household and authorize a spouse by Firebase UID. Both open the same household ID from the cookbook's **Household sync** page.

When signed in and connected, Firestore snapshots push updates to authorized devices; a small debounce batches local edits into Firestore transactions. Changes to different records can merge, while conflicting changes to the same item require manual review. Initial setup and two-device acceptance testing have not been completed in a user-owned Firebase project.
