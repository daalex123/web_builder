# CMS — Static HTML Website + Admin

WordPress-like CMS with a static HTML front site and an admin dashboard.

## Stack

| App | Purpose | Port |
|-----|---------|------|
| `apps/web` | Static public site (Next.js export) | 3000 |
| `apps/admin` | CMS admin dashboard | 3001 |
| `packages/db` | Supabase data layer | — |
| `packages/shared` | Content schemas, SEO, renderer | — |

## Quick start

**Requires Node 20.19+** (recommended: **22** — see `.nvmrc`).

```bash
npm run install:local   # checks Node, installs deps + env + database
npm run dev:all         # web :3000 + admin :3001 (macOS/Linux)
```

The installer will auto-switch Node via **fnm** or **nvm** if installed. Otherwise it prints install links.

On **Windows**, run admin and web in two terminals:

```bash
npm run dev:admin
npm run dev:web
```

Or step by step:

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
│   ├── db/             # Supabase queries + seed
│   └── shared/         # Shared types & utilities
```

## Environment

Copy `apps/admin/.env.example` to `apps/admin/.env.local` and fill in your Supabase credentials.

**Project:** `cquqhtbqiklcjarlauek` → `https://cquqhtbqiklcjarlauek.supabase.co`

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://cquqhtbqiklcjarlauek.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."          # Settings → API
SUPABASE_SERVICE_ROLE_KEY="..."              # Settings → API (server only)
SUPABASE_STORAGE_BUCKET="media"

AUTH_SECRET="your-secret"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_WEB_URL="http://localhost:3000/web"
```

Media uploads go to the **`media`** storage bucket (public read). The CMS stores the full Supabase public URL in the database.

After setting env vars, run:

```bash
npm install
npm run db:seed    # seed from apps/web/content
```

Optional: set `PREVIEW_SYNC=false` to disable auto-sync on save.

## Deploying to Vercel

The admin app (`apps/admin`) is configured for Vercel monorepo deployment.

1. Import the repo in [Vercel](https://vercel.com) and set **Root Directory** to `apps/admin`
2. Add environment variables (Project → Settings → Environment Variables):

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `SUPABASE_STORAGE_BUCKET` | Yes (`media`) |
| `AUTH_SECRET` | Yes |
| `ADMIN_PASSWORD` | Yes |

3. Deploy — `vercel.json` runs `npm install` from the monorepo root

**On Vercel:**
- **Admin** → `https://your-app.vercel.app/admin`
- **Live site** → `https://your-app.vercel.app/web` (reads from Supabase, no disk sync)
- **Media** → Supabase Storage (local `/uploads` is not available)
- **Static zip export** → run `npm run build` locally; Vercel cannot build `site.zip` in serverless

Optional: set `NEXT_PUBLIC_SITE_URL` to your custom domain if `VERCEL_URL` is not sufficient.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:admin` | Start admin dev server |
| `npm run dev:web` | Start live preview dev server |
| `npm run dev:all` | Start admin + preview together |
| `npm run build` | Build static public site |
| `npm run setup` | Seed Supabase from content JSON |

## Database

PostgreSQL on Supabase (`cquqhtbqiklcjarlauek`). The app uses `@supabase/supabase-js` via `@cms/db` — no ORM required.
