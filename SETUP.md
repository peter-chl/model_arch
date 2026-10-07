# Setup

How this site is built and deployed, and how to stand up another one like it for a
different topic. Written as a runbook — follow it top to bottom.

## What this is

A static Next.js site. There is no server at runtime: `next build` emits plain HTML,
CSS, JS and images into `out/`, and GitHub Pages serves that directory. Every
consequence below follows from that one fact.

---

## Part A — Starting a new topic site

### 1. Create the GitHub repo

Make an empty repo first. The repo name matters: it becomes part of the public URL
(`https://<user>.github.io/<repo>`) and must be written into `basePath`.

### 2. Give Claude access to it

A session's repositories are fixed when the session starts, so you cannot add a new
repo to an existing session. Instead:

- Connect or reconnect GitHub at https://claude.ai/connect-github
- Install the Claude GitHub App on the new repo (an org owner may need to approve if
  the repo is under an organization)
- Start a **new session** from claude.ai/code with the new repo selected

Environment settings — network egress policy, environment variables, setup scripts —
are configured per environment and documented at
https://code.claude.com/docs/en/claude-code-on-the-web

### 3. Copy the scaffolding

Copy this repo and strip the content. Faster and less error-prone than rebuilding it.
Keep:

```
.github/workflows/deploy.yml
next.config.ts
package.json           (change "name")
tsconfig.json          (provides the @/* -> ./src/* alias)
postcss.config.mjs
eslint.config.mjs
.gitignore
scripts/generate-og.mjs
src/app/layout.tsx     (edit the constants, see below)
src/app/globals.css
```

Delete all content data (`src/data/models/*.ts`) and the generated cards
(`public/og/*.png`). Rewrite `types.ts` for the new domain.

### 4. Change these four things

| File | What to change |
| --- | --- |
| `next.config.ts` | `basePath: "/<repo-name>"` — must match the repo name exactly |
| `src/app/layout.tsx` | `SITE_URL`, `SITE_NAME`, `DESCRIPTION`, and the `metadata` title template |
| `package.json` | `"name"` |
| `CLAUDE.md` | Project description and the git workflow rule |

### 5. Turn on Pages

Repo **Settings → Pages → Source = GitHub Actions**.

This is a manual, one-time step and nothing deploys without it. The workflow will run
and go green while the site stays 404 if you skip it.

### 6. Push

```bash
git push origin HEAD:main
```

The workflow runs on every push to `main`. Watch it under the repo's Actions tab;
first deploy takes a couple of minutes.

---

## Part B — How the pieces fit

### Static export

`next.config.ts`:

```ts
output: "export"              // emit out/ instead of running a server
basePath: "/<repo-name>"      // GitHub Pages serves from a subpath
images: { unoptimized: true } // no image optimizer without a server
```

### Deploy workflow

`.github/workflows/deploy.yml` — checkout, Node 20, `npm ci`, `npm run build`, then
`upload-pages-artifact` with `path: out` and `deploy-pages`. It needs
`permissions: { contents: read, pages: write, id-token: write }`.

### Content layer

Content is typed data, not MDX. Three parts:

- `src/data/<topic>/types.ts` — the interfaces every entry conforms to
- `src/data/<topic>/<entry>.ts` — one file per entry, a named `export const` typed
  against those interfaces
- `src/data/<topic>/index.ts` — imports every entry, re-exports `types`, exports the
  ordered array and a `getBySlug` lookup

This is why adding an entry is one new file plus one line in the registry. It also
means a schema change is caught by `tsc` across all entries at once, instead of
silently rendering wrong.

### Routing

One dynamic route renders every entry:

```ts
// src/app/<topic>/[slug]/page.tsx
export function generateStaticParams() {
  return entries.map((e) => ({ slug: e.slug }));
}
```

`generateStaticParams` is what makes static export enumerate the pages. Without it the
route produces nothing. `generateMetadata` in the same file sets per-page title,
description and OG tags.

Keep the page component thin — it looks up the entry and hands it to a `"use client"`
viewer component. Interactive bits (variant switchers, expandable panels) live in the
viewer.

### OG images

Static export cannot generate OG images on request, so they are built ahead of time and
committed.

`scripts/generate-og.mjs` renders a 1200x630 PNG per entry plus a `default.png`, using
`satori` (JSX-like objects to SVG) and `@resvg/resvg-js` (SVG to PNG). It is wired into
the build:

```json
"build": "tsx scripts/generate-og.mjs && next build"
```

Two non-obvious constraints:

- It runs under `tsx`, not plain node, because it imports the TypeScript data files
  directly (`await import("../src/data/models/index.ts")`).
- Fonts are read from `node_modules/@fontsource/*/files/*.woff` with `readFileSync`,
  not fetched. Build machines should not depend on network access, and the Google
  Fonts URLs change.

`out/` is gitignored; `public/og/` is **not**. The PNGs are committed artifacts.

---

## Part C — Gotchas

These all cost real time at least once.

**`basePath` must equal the repo name.** If it does not, the HTML loads but every JS
chunk 404s. The symptom is a page that looks correct and is completely dead — clicking
anything does nothing, because React never hydrated. Check the browser network tab for
404s on `/_next/static/...` before suspecting your component code.

**Serving `out/` locally needs the basePath too.** Serving `out/` at the web root
reproduces the dead-page symptom above. Serve it one level up instead:

```bash
mkdir -p /tmp/srv && ln -sfn "$PWD/out" /tmp/srv/<repo-name>
cd /tmp/srv && python3 -m http.server 4323
# then open http://localhost:4323/<repo-name>/<topic>/<slug>.html
```

Note the `.html` — `python -m http.server` will not resolve extensionless paths.

**Set Pages source to GitHub Actions.** See A.5. The workflow succeeds either way, so
a green check is not proof the site is live.

**Commit regenerated OG images.** `npm run build` rewrites `public/og/`. If you change
an entry's name, org or description, its card changes and must be committed with it.

**The container can reset mid-session.** It may come back at an older commit than
`origin/main`, with `node_modules` gone. Pushing from that state silently reverts work.
Before committing after any interruption:

```bash
git fetch origin main
git log --oneline -1            # local
git log --oneline origin/main -1  # remote
```

If local is behind, save your edits (`git diff > /tmp/wip.patch`), reset onto the real
head (`git checkout -B <branch> origin/main`), then re-apply.

**Outbound network is filtered.** The egress proxy blocks many hosts, including
arxiv.org and huggingface.co. `WebSearch` generally works, and cloning a public GitHub
repo works — for anything with released code, reading the actual configs beats reading
the paper anyway.

---

## Part D — Day-to-day

### Add an entry

1. Create `src/data/<topic>/<entry>.ts`
2. Import and register it in `src/data/<topic>/index.ts`
3. `npm run build` — regenerates OG cards and type-checks every entry
4. Commit the new `public/og/<slug>.png` along with the source
5. `git push origin HEAD:main`

### Verify a UI change before pushing

Type-checking proves the code compiles, not that the feature works. For anything
interactive, build and drive it in a real browser:

```bash
npm run build
# serve under basePath as shown in Part C, then use Playwright
```

Chromium is preinstalled at `/opt/pw-browsers/chromium`. Install the driver with
`npm install --no-save playwright` and launch with
`chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`. Wait a few seconds
after `networkidle` for hydration before clicking anything, and check
`document.documentElement.scrollWidth` at a 400px viewport to catch horizontal overflow.

Scratch scripts go in the scratchpad directory, or delete them before committing.

### Useful commands

```bash
npm run dev     # local dev server, basePath applies
npm run build   # OG generation + static export to out/
npm run lint
```
