# Family Recipes

Markdown-first public cookbook, built for GitHub Pages, with a private-to-your-browser pantry, meal planning and shopping list.

## Open the cookbook
After GitHub Pages is enabled, visit **https://cbaum228.github.io/family-recipes/**.

## Features
- All recipe ingredient rows always display precise canonical grams/ml followed by an approximate US-unit equivalent in parentheses (lb, oz or fl oz). Both scale automatically when serving counts change; no toggle or ingredient-count estimates. MacroFactor structured recipe data and shopping arithmetic remain metric-only.
- Searchable, publicly forkable recipes in `_recipes/*.md`, separated into **planned**, **tested**, and **needs-reconstruction**.
- Per-recipe serving scaling (one serving is a full reference portion, not a household meal); use recipe link import into MacroFactor for baseline quantities or copy the scaled text into its AI importer.
- Pantry quantities and optional use-by dates in your browser. Recipe recommendations consider quantity-weighted pantry coverage, nearing use-by dates, and recent cuisine variety. No unverified macro estimates are fabricated.
- Grocery trip checklist that freezes missing items from planned recipes. Checking off a purchased item adds the actual quantity (and optional use-by date) to the pantry. Purchased items remain visible; AnyList bulk paste and CSV are optional fallbacks.
- A Cook action on every planned recipe lets you edit actual ingredient quantities, enter extras from the known ingredient catalog, record final cooked weight, and deduct pantry stock after confirmation. Cooking history retains actual ingredient amounts.
- JSON backup and import for moving private household data between devices.

## Privacy and limitations
**The GitHub repository and GitHub Pages website are public.** The site does not publish your pantry, food logs, family schedule, or private meal history. Your browser stores those values in `localStorage`, so they are not available on other devices and can be lost if site data is cleared. Download a private backup regularly; do not commit that backup to any public repository.

A private GitHub repository is **not** automatically a private web database, and private GitHub Pages sites are not necessarily private to viewers. No GitHub token or secrets should be placed in frontend code. Household synchronization requires an authenticated service in a later phase.

Recipe serving counts are approximate: weigh cooked recipes, then portion based on their actual cooked weight. Nutrition and recipe imports must be reviewed in MacroFactor. The JSON-LD recipe metadata is for **unscaled baseline** quantities; scaled recipe quantities can be copied as plain text. Optional sides, such as rolls and rice, are logged separately.

## Publish
In repository **Settings → Pages → Build and deployment**, choose **Deploy from a branch → main → /(root)**. The root uses Jekyll to build the Markdown recipe collection into public HTML pages.

## Add a recipe
Copy one of the complete Markdown files in `_recipes/`. Each ingredient needs a numeric `amount`, canonical `unit` (g or ml), `shopping_key`, `shopping_name` and `aisle`; the last fields allow pantry matching and merged shopping quantities. Use `status: ready-to-test` until cooked and reviewed; do not mark a recipe `nutrition_verified: true` until its source and calculations are checked.

The cookbook is designed to be forked. Fork the repository, update `url` and `baseurl` in `_config.yml`, and enable GitHub Pages on your own fork. Pantry data stays within the visiting browser and does not flow back to the original repository.

## Future shared pantry synchronization

See [Google Drive sync design](docs/google-drive-sync.md). The current site does **not** sync across devices. A Google Drive file shared privately with specified Google accounts can be an opt-in storage backend for household pantry, plans and cooking history, without making those records public. It requires Google OAuth configuration, explicit user sign-in and concurrent-edit handling; do not place Google account credentials or bearer tokens in the public repository.

## Shopping with AnyList

From **Meal planner**, tap **Copy for AnyList**, then open the shared AnyList grocery list, tap its Add Item field, and use AnyList\'s bulk-paste control. The clipboard contains *only unstocked ingredients*, with one quantity-first line per item and no headings or checkboxes. AnyList categorizes the imported items and lets household members cross them off as usual. Check that AnyList interpreted the quantities correctly, and check for duplicates if pasting into a list that already has items. No direct API access or cross-app pantry updates are implied.

AnyList instructions: https://help.anylist.com/articles/paste-items/

## New shopping and cooking workflow

1. Choose and scale recipes in Meal planner.
2. Click **Build / refresh shopping trip**. The shopping list freezes the missing ingredient quantities after pantry subtraction. Grocery lines remain in the list after checking them off.
3. Enter actual purchased quantity and optional use-by date, then check the item. This adds a distinct pantry lot. Unchecking removes the lot if it has not already been edited or consumed.
4. When cooking, click **Cook** beside the planned recipe. Review the default quantities, set skipped ingredients to zero, and add other ingredients from the known catalog. Optionally record finished cooked batch weight for MacroFactor. Confirm to deduct the amounts actually used and save the cooking record.
5. To shop from another device using the same shared household inventory, the planned private Google Drive sync must be configured and implemented first. Until then, shopping and cooking state are local to the current browser only.

Limitations: manually adding arbitrary groceries not already in a planned recipe, undoing partially consumed purchases, recipe substitutions absent from the ingredient catalog, and Google Drive cross-device sync need additional work. Pantry shortages on cooking are confirmed and recorded without allowing negative inventory.
