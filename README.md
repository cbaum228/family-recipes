# Family Recipes

Markdown-first public cookbook, built for GitHub Pages, with a private-to-your-browser pantry, meal planning and shopping list.

## Open the cookbook
After GitHub Pages is enabled, visit **https://cbaum228.github.io/family-recipes/**.

## Features
- Searchable, publicly forkable recipes in `_recipes/*.md`, separated into **planned**, **tested**, and **needs-reconstruction**.
- Per-recipe serving scaling (one serving is a full reference portion, not a household meal); use recipe link import into MacroFactor for baseline quantities or copy the scaled text into its AI importer.
- Pantry quantities and optional use-by dates in your browser. Recipe recommendations consider quantity-weighted pantry coverage, nearing use-by dates, and recent cuisine variety. No unverified macro estimates are fabricated.
- Combined shopping list, subtracting inventory, with copy and CSV download.
- Mark recipes cooked to deduct available pantry lots (with confirmation) and record cuisine history.
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
