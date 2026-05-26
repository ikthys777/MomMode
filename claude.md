# Mom Mode — Claude Development Guide

## Architecture

Single-file React PWA. All code lives in `index.html` inside a `<script type="text/babel">` tag. Babel standalone handles JSX transform in-browser. No build step, no bundler, no node_modules.

### File Structure
```
index.html    — Full application (React + CSS-in-JS + all logic)
sw.js         — Service worker (cache-first with network update)
manifest.json — PWA manifest (name, icons, theme)
icon-192.svg  — App icon (192px)
icon-512.svg  — App icon (512px)
```

### Key Conventions
- **CSS-in-JS** — All styles are inline objects. No external CSS. Common styles: `cardStyle`, `chipStyle`, `primaryBtn`, `iconBtnStyle`, `textareaStyle`, `settingsLabel`.
- **Font** — Quicksand (`QS` constant), loaded from Google Fonts CDN.
- **Icons** — Lucide React icons, imported individually. Available icons are defined as `mkIcon()` functions at the top of the script.
- **State** — All React `useState`. No Redux, no context. LocalStorage via `store.get()`/`store.set()` with `mm-` prefix on all keys.
- **Color theme** — Dark (#0a0a0a background), purple accent (#BB86FC). Settings uses #4ADE80 for toggles.
- **Tabs** — `clock`, `notes`, `recipes`, `meals`, `grocery`. Controlled by `tab` state.
- **Sub-views** — Within tabs, `subView` state handles detail/edit views. `resetSubView()` returns to list.

## AI Integration

### Provider Routing
`callAI()` is the router. Checks `aiProvider` state ("claude" or "grok") and dispatches to `callClaude()` or `callGrok()`.

### Claude API
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-haiku-4-5-20251001` (default), `claude-sonnet-4-20250514` (fallback when no API key — uses built-in)
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true`

### Grok API — Dual Endpoint
- **Chat Completions** (`/v1/chat/completions`): Used for text-only tasks (categorization, smart add). Model: `grok-3-mini-fast`.
- **Responses API** (`/v1/responses`): Used for web search (recipe URL extraction) and vision. Model: `grok-4-1-fast-reasoning`. Input must be array of message objects, not plain string.

### Vision
`callClaudeVision()` and `callGrokVision()` handle image analysis. **Vision always uses Claude first** regardless of provider toggle — Haiku significantly outperforms Grok on accuracy. Grok is fallback only when no Claude API key is set.

Image pipeline: `resizeImageToBase64(file, 800px)` → vision API → text extraction.

Two vision entry points:
1. **Image-to-grocery** (`handleGroceryImage`): Camera button on Grocery tab. Routes extracted text through `setPendingIngredients()` so multiplier modal appears.
2. **Image-to-recipe** (`handleRecipeImage`): "From Photo" button on recipe edit form. Appends extracted text to `recipeIngredients` textarea.

## Supabase Sync

### Grocery Sync
- Table: `grocery_sync` (family_code, items JSON, updated_at)
- Push on every local save. Pull every 10 seconds.
- `syncRef` prevents pull→save→push loops.
- `lastSyncTs` deduplicates by timestamp.

### Family Recipe Library
- Table: `recipe_library` (family_code, title, category, url, ingredients, instructions, shared_at)
- Push: `pushFamilyRecipe()` with title dedup (ilike match).
- Pull every 30 seconds. Displayed under "Family" chip in recipe filter bar.
- Delete: `deleteFamilyRecipe()` with `confirmDelete` dialog. Only accessible from full recipe view.
- Save to local: `saveFamilyRecipeToLocal()` copies to personal recipes with title dedup.

### Battery Optimization
Both polling intervals pause when `tab === "clock"` or `document.hidden`. Uses `groceryIntervalRef` and `familyIntervalRef` (useRef) to manage intervals cleanly. Tab is in the useEffect dependency array.

## Grocery Features

### Smart Add (`doSmartAdd`)
AI converts ingredient text to structured grocery items with categories. Returns `{name, qty, category}` separately. Supports optional `multiplier` parameter (1-4x) that instructs AI to scale all quantities.

### Quantity Stacking
When a new item matches an existing grocery item by base name (split on ` - `), the quantity is appended with ` + ` instead of creating a duplicate. Example: "Soy sauce - 1/3 cup" + new "1/4 cup" → "Soy sauce - 1/3 cup + 1/4 cup".

### Multiplier Modal
All paths to grocery (recipe view, image scan, family recipe) route through `setPendingIngredients()` which triggers the modal. Modal shows Yield selector (1x/2x/3x/4x) before Smart Add. Multiplier resets to 1 after use.

## Recipe Extraction
`extractRecipe()` sends a URL to AI with web search tool enabled. AI fetches the page and returns structured JSON with title, ingredients, and instructions. Auto-fills the recipe form.

## Encrypted Backup
Export: AES-256-GCM encryption with user-provided family code as key. Exports all localStorage keys with `mm-` prefix plus API keys and Supabase credentials.
Import: Decrypts and restores all data.

## Service Worker
Cache name includes version number (`mom-mode-v16`). Bump version on every deploy to bust cache. Strategy: network-first with cache fallback. On install, pre-caches all assets. On activate, deletes old caches.

## Common Tasks

### Adding a new tab
1. Add tab name to the bottom nav bar render (search for `"clock"`, `"notes"` etc.)
2. Add tab content render in the main content area (search for `tab === "clock"`)
3. Add any new state variables near the top
4. If tab has data, add localStorage persistence with `mm-` prefix

### Adding a new icon
Search for `const IconName = mkIcon(` at the top. Add new icon using Lucide SVG path data.

### Updating service worker
Bump the version number in `sw.js`: `const CACHE_NAME = 'mom-mode-vXX'`

## Paired App
Dad Does (`DadDoes` repo) is the companion app. Same codebase with green (#4ADE80) theme, `dd-` localStorage prefix, and `DadDoes` function name. All features are mirrored. Changes should be applied to both apps.
