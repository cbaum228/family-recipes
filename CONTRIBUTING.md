# Contributing recipes

Welcome! This is a **public** cookbook. You can submit a family recipe in **US measurements, metric measurements, plain text, screenshots, or photos**; the contributor workflow converts it into the repository's canonical Markdown format.

**Start here:**
- [Copy/paste ChatGPT prompt and GitHub phone setup](docs/chatgpt-recipe-prompt.md)
- [Canonical recipe Markdown template and compatibility checklist](docs/recipe-template.md)
- [Example: Pumpkin Bars](./_recipes/pumpkin-bars.md)
- [Contributor/agent rules](AGENTS.md)

## Publishing with ChatGPT

1. Give ChatGPT the [contributor prompt](docs/chatgpt-recipe-prompt.md) plus a recipe (text or pictures).
2. Have it read the actual repository schema and check for an existing version of the same dish.
3. It should create/update the exact `_recipes/<slug>.md` file, preserving original measurements and noting estimated conversions.
4. **If write tools are actually available**, let it commit the change or open a PR after review. If it has **read-only** GitHub access, ask for the complete Markdown and paste it using GitHub's phone browser editor.
5. Check that the recipe appears on [Family Recipes](https://cbaum228.github.io/family-recipes/) after GitHub Pages rebuilds.

**Access:** The repository owner must invite other GitHub accounts as collaborators. Each contributor separately connects their GitHub account to their own ChatGPT/Codex account. The standard ChatGPT GitHub app is read-only, so collaborator access alone does not enable autonomous ChatGPT commits. See the setup guide for options.

## Recipe data standards

- New recipes live in `_recipes/*.md`; file slug and front-matter slug match.
- Ingredients require `name`, numeric `amount`, canonical `unit` (`g` or `ml`), `shopping_key`, `shopping_name`, and `aisle`. Reuse existing shopping keys for pantry consistency.
- Convert original cups, tsp, oz, eggs and other US units to ingredient-appropriate grams or milliliters. **Preserve the original** in `note` and a source/measurement section. Label estimates as estimates.
- New complete recipes are `ready-to-test`. A recipe is `tested` only if the cook confirms results. Incomplete records are `needs-reconstruction`.
- Keep `nutrition_verified: false` unless actual nutrition is verified. Preserve actual cooking modifications and yield history without claiming assumptions are measured.
- One ordinary serving is a full-size meal portion; baked goods may use `yield_unit` (e.g., bars).
- Public code and recipes must **never contain private household pantry backups, personal schedules, account credentials, access tokens, or other family-private information**.
- Recipe site exposes baseline Schema.org Recipe JSON-LD for URL import; verify any external nutrition/importer parsing.

The source-of-truth recipe template and detailed rules are in `docs/recipe-template.md`. Keep the master recipe data metric for pantry and shopping calculations even when a contributor prefers English/US measurements.
