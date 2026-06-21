# CMS — Static HTML Website + Admin

WordPress-like CMS with a static HTML front site and an admin dashboard.

## Stack

| App | Purpose | Port |
|-----|---------|------|
| `apps/web` | Static public site (Next.js export) | 3000 |
| `apps/admin` | CMS admin dashboard | 3001 |
| `packages/db` | Prisma + SQLite database | — |
| `packages/shared` | Content schemas, SEO, renderer | — |

## Quick start

```bash
nvm use 22
npm install
npm run setup          # create DB + seed from existing content
npm run dev:admin      # admin at http://localhost:3001
npm run dev:web        # live preview at http://localhost:3000
```

### Live preview workflow

1. Keep **`npm run dev:web`** running in one terminal
2. Edit content in admin — saves auto-sync to `apps/web/content/`
3. **Refresh** the preview browser tab to see changes (drafts included)
4. Use **Publish & Build Site** only when deploying static HTML to production

**Admin login:** password `admin123` (change via `ADMIN_PASSWORD` in `apps/admin/.env.local`)

## Admin features (Phase 2)

### Content editing
- **Pages** — tabbed editor (Content | SEO)
- **TipTap rich text** — headings, lists, quotes, code blocks, alignment, underline, links, images from media library
- **SEO panel** — live Google search preview, meta title/description, OG image picker, noindex, canonical URL
- **Duplicate** — clone any page as a draft
- **Templates** — standard page or homepage template

### AI Page Builder
- **Describe a page** — natural language prompt (audience, sections, tone)
- **Reference URL** — optional public website for structure and copy inspiration
- **Reference image** — optional screenshot/mockup analyzed with vision AI
- **Draft output** — creates a page with widget sections; refine in the visual editor
- Requires `OPENAI_API_KEY` in `apps/admin/.env.local` (OpenAI `sk-...` or NVIDIA `nvapi-...`)

### Media library
- **Drag & drop** multi-file upload (images, PDF, video)
- **10 MB** file size limit with type validation
- **Organized storage** — files saved to `uploads/YYYY/MM/`
- **Search & filter** — by name, images only, documents
- **Grid / list views** — inline alt-text editing
- **Media picker** — browse library when inserting images or OG images

### Publish
- **Live preview** — `dev:web` reads synced JSON; refresh after saving in admin
- **Production** — export published content → JSON → static HTML build

## Publish workflow

### Development (live preview)
1. Run `npm run dev:web` alongside `npm run dev:admin`
2. Save content in admin — JSON syncs automatically to `apps/web/content/`
3. Refresh the preview site in your browser

### Production
1. Mark content as **published** in admin
2. Go to **Publish** → **Publish & Build Site**
3. Static HTML is output to `apps/web/out/`

## Project structure

```
cms/
├── apps/
│   ├── admin/          # CMS dashboard
│   └── web/            # Static public site
│       ├── content/    # JSON content (written on publish)
│       └── out/        # Generated HTML
├── packages/
│   ├── db/             # Prisma schema + queries
│   └── shared/         # Shared types & utilities
```

## Environment

Uses **PostgreSQL** via [Prisma Postgres](https://vercel.com/marketplace/prisma) (recommended for Vercel) or any Postgres provider.

### Vercel setup

1. Vercel project → **Storage** → **Connect Database** → **Prisma**
2. Vercel adds `DATABASE_URL` automatically
3. Copy the **direct** connection string from [Prisma Console](https://console.prisma.io/) and add it as `DIRECT_URL` in Vercel env vars
4. Pull env locally: `vercel env pull apps/admin/.env.local`
5. Push schema once: `npm run db:push` then `npm run db:seed`

`apps/admin/.env.local`:

```
DATABASE_URL="postgresql://..."   # pooled — app runtime
DIRECT_URL="postgresql://..."     # direct — Prisma CLI only
AUTH_SECRET="your-secret"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."   # or NVIDIA nvapi-... key
```

Also set the same `DATABASE_URL` and `DIRECT_URL` in `packages/db/.env` for Prisma CLI commands.

Optional: set `PREVIEW_SYNC=false` to disable auto-sync on save.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:admin` | Start admin dev server |
| `npm run dev:web` | Start live preview dev server |
| `npm run dev:all` | Start admin + preview together |
| `npm run build` | Build static public site |
| `npm run setup` | Init database + seed |
| `npm run db:studio` | Open Prisma Studio |

## Vercel deploy (admin app)

- **Root directory:** `apps/admin`
- **Build command:** `cd ../.. && npm install && npm run build:admin`
- **Install command:** `npm install` (from repo root if using default)
- Required env vars: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_WEB_URL`

> **Note:** Media uploads and content sync still write to the local filesystem — they won't persist on Vercel until you add blob storage.
