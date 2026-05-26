# Mom Mode

Family organizer PWA — clock, notes, recipes, meals & grocery list. Built for Holli.

## Features

**Clock** — Three styles (digital, analog, minimal) with 14 color options. Wake lock keeps screen on for shift use as a desk clock.

**Notes** — Create, pin, search, sort. Swipe-to-delete. Full offline support.

**Recipes** — Add manually or extract from URL via AI (web search). Screenshot-to-ingredients via Claude Haiku vision. Pin, categorize (Breakfast, Lunch, Dinner, Dessert, Snack, Side Dish, Sauce, Quick & Easy, Slow Cooker), search, sort.

**Family Recipe Library** — Shared recipe storage on Supabase. Push recipes to family library, browse from both phones, save to local collection, add ingredients to grocery. Delete with confirmation from full recipe view only.

**Meal Planner** — Weekly meal planning grid.

**Grocery List** — Synced between phones via Supabase. AI-powered smart add with store categories (Produce, Dairy & Eggs, Meat & Seafood, etc). Screenshot-to-grocery via vision AI. Quantity stacking across recipes. Yield multiplier (1-4x). Swipe-to-delete. Category filtering. Share list.

## AI Integration

Dual provider support — Claude (Anthropic) and Grok (xAI), toggled in Settings.

| Function | Provider | Model |
|---|---|---|
| Vision (image → ingredients/grocery) | Always Claude first | claude-haiku-4-5-20251001 |
| Recipe URL extraction (web search) | Follows toggle | grok-4-1-fast-reasoning / Haiku |
| Categorization & smart add | Follows toggle | grok-3-mini-fast / Haiku |

## Sync

Supabase real-time sync for grocery list (10s polling) and family recipe library (30s polling). Polling pauses on clock tab and when app is backgrounded to conserve battery. Family code scopes data between paired devices (Mom Mode ↔ Dad Does).

## Tech Stack

Single-file React PWA (index.html with Babel transform). No build step. Lucide icons. Quicksand font. Service worker for offline caching. AES-256-GCM encrypted backup export/import.

## Deployment

Hosted on GitHub Pages. Install as PWA on mobile. Clear site data after updates to pick up new service worker.

## Theme

Dark background (#0a0a0a), purple accent (#BB86FC).
