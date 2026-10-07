# Setup

How this site is deployed, and how to stand up another one for a different topic.

The deployment target imposes a handful of real constraints. Almost everything else —
design, content model, page structure — is a free choice this site happened to make
one way. Part B is the part you must follow. Part C is the part you should feel free
to throw out.

## The one fact

This is a static site. There is no server at runtime: `next build` emits plain HTML,
CSS, JS and images into `out/`, and GitHub Pages serves that directory. Every
constraint in Part B follows from that.

---

## Part A — Standing up a new topic site

### 1. Create the GitHub repo

Empty is fine. The name becomes part of the public URL
(`https://<user>.github.io/<repo>`) and must be written into `basePath`.

### 2. Give Claude access

A session's repositories are fixed when the session starts, so you cannot add a new
repo to an existing session.

- Connect or reconnect GitHub at https://claude.ai/connect-github
- Install the Claude GitHub App on the new repo (an org owner may need to approve if
  it lives under an organization)
- Start a **new session** from claude.ai/code with that repo selected

Environment settings — network egress policy, environment variables, setup scripts —
are per-environment and documented at
https://code.claude.com/docs/en/claude-code-on-the-web

### 3. Scaffold

Either path works:

- **From scratch.** `create-next-app`, then apply Part B. Best when the new topic
  wants a different shape than this one.
- **Copy this repo.** Faster, and worth it if the new topic is also a catalog of
  structurally similar entries. Delete `src/data/models/*`, `public/og/*`, and
  `src/app/models/`, then rewrite from there.

### 4. Change these

| File | What |
| --- | --- |
| `next.config.ts` | `basePath: "/<repo-name>"` — must match the repo name exactly |
| `src/app/layout.tsx` | `SITE_URL`, `SITE_NAME`, `DESCRIPTION`, title template |
| `package.json` | `"name"` |
| `CLAUDE.md` | Project description and git workflow rule |

### 5. Turn on Pages

Repo **Settings → Pages → Source = GitHub Actions**.

Manual, one-time, and nothing deploys without it. The workflow goes green either way,
so a passing build is not proof the site is live.

### 6. Push

```bash
git push origin HEAD:main
```

Deploys on every push to `main`. Watch the Actions tab; first deploy takes a minute or
two.

---

## Part B — The load-bearing core

This is the whole required surface. It is small.

**`next.config.ts`**

```ts
output: "export"              // emit out/ instead of running a server
basePath: "/<repo-name>"      // Pages serves from a subpath, not the domain root
images: { unoptimized: true } // no image optimizer without a server
```

**`.github/workflows/deploy.yml`** — checkout, Node 20, `npm ci`, `npm run build`,
`upload-pages-artifact` with `path: out`, `deploy-pages`. Needs
`permissions: { contents: read, pages: write, id-token: write }`. Copy it as-is.

**Pages source set to GitHub Actions** (A.5).

**`generateStaticParams`** on any dynamic route. Static export enumerates pages only
through it; without it a `[slug]` route emits nothing.

**`out/` stays gitignored.** It is a build artifact, rebuilt in CI on every push.

Anything that needs a server is unavailable: route handlers, middleware, ISR, image
optimization, and the runtime `ImageResponse` OG endpoint.

---

## Part C — What this site chose

None of this is required. It suits a reference catalog of structurally similar
entries. A different topic may want something completely different — change freely.

| Concern | This site | Consider instead |
| --- | --- | --- |
| Content model | Typed TS data files | MDX for prose-heavy topics; a headless CMS if non-developers edit |
| Page structure | One `[slug]` route + thin server page handing off to a `"use client"` viewer | Per-page routes when layouts are bespoke rather than uniform |
| Styling | Tailwind v4, dark palette, monospace for figures | Anything. No part of the deploy depends on it |
| Math | KaTeX, rendered at render-time into HTML | Drop it entirely if the topic has no formulas |
| Social cards | Pre-generated PNGs (see below) | Skip them, or hand-draw a single static card |

### On the content model

The typed-data approach means `src/data/<topic>/types.ts` defines interfaces, one file
per entry exports a `const` typed against them, and `index.ts` registers them into an
ordered array plus a `getBySlug` lookup.

It pays off when entries share structure: adding one is a file plus a registry line,
and a schema change is caught by `tsc` across every entry at once instead of silently
rendering wrong. It pays off much less for essays or tutorials, where MDX is the
better tool. Pick per topic.

### On social cards

Static export cannot generate OG images on request, so if you want per-page cards they
must be built ahead of time and committed. This site does that in
`scripts/generate-og.mjs` with `satori` (JSX-like objects to SVG) and `@resvg/resvg-js`
(SVG to PNG), wired in as `"build": "tsx scripts/generate-og.mjs && next build"`.

Two details if you reuse it:

- It runs under `tsx`, not plain node, because it imports the TypeScript data files
  directly (`await import("../src/data/models/index.ts")`).
- It reads font bytes from `node_modules/@fontsource/*/files/*.woff`, because satori
  needs raw woff buffers. That is unrelated to how the site itself loads fonts — pages
  here use `next/font/google`, which is a separate mechanism.

`out/` is gitignored but `public/og/` is not; the PNGs are committed artifacts.

Skipping all of this is perfectly reasonable. A single hand-made `public/og.png`
referenced from `layout.tsx` gets you most of the benefit for none of the machinery.

---

## Part D — Gotchas

Platform-level, and independent of whatever design you pick.

**`basePath` must equal the repo name.** Otherwise the HTML loads but every JS chunk
404s. The symptom is a page that looks completely correct and is totally dead —
clicking does nothing, because React never hydrated. Check the network tab for 404s on
`/_next/static/...` before suspecting component code.

**Serving `out/` locally needs the basePath too.** Serving it at the web root
reproduces that same dead page. Serve one level up:

```bash
mkdir -p /tmp/srv && ln -sfn "$PWD/out" /tmp/srv/<repo-name>
cd /tmp/srv && python3 -m http.server 4323
# http://localhost:4323/<repo-name>/<path>.html
```

The `.html` matters — `python -m http.server` will not resolve extensionless paths.

**Commit regenerated build artifacts.** If you use the OG pipeline, `npm run build`
rewrites `public/og/`; changed titles or descriptions mean changed cards that need to
be committed alongside the source.

**The container can reset mid-session**, sometimes to an older commit with
`node_modules` gone. Pushing from that state silently reverts work. After any
interruption:

```bash
git fetch origin main
git log --oneline -1
git log --oneline origin/main -1
```

If local is behind, stash the work (`git diff > /tmp/wip.patch`), reset onto the real
head (`git checkout -B <branch> origin/main`), then re-apply.

**Outbound network is filtered.** The egress proxy blocks many hosts, including
arxiv.org and huggingface.co. `WebSearch` generally works, and cloning a public GitHub
repo works — for anything with released code, reading the actual configs tends to beat
reading the paper anyway.

---

## Part E — Day-to-day

### Add an entry (typed-data model)

1. Create `src/data/<topic>/<entry>.ts`
2. Register it in `src/data/<topic>/index.ts`
3. `npm run build` — type-checks every entry, and regenerates OG cards if used
4. Commit any regenerated `public/og/*.png` with the source
5. `git push origin HEAD:main`

### Verify UI changes before pushing

Type-checking proves it compiles, not that it works. For anything interactive, build
and drive it in a real browser.

Chromium is preinstalled at `/opt/pw-browsers/chromium`. Install the driver with
`npm install --no-save playwright` and launch with
`chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`. Serve under the
basePath as in Part D. Wait a few seconds past `networkidle` for hydration before
clicking, and check `document.documentElement.scrollWidth` at a 400px viewport to
catch horizontal overflow.

Keep scratch scripts out of the repo, or delete them before committing.

### Commands

```bash
npm run dev     # local dev server, basePath applies
npm run build   # static export to out/ (plus OG generation, if wired in)
npm run lint
```
