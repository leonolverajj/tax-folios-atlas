# Publishing on GitHub Pages

The site is plain static files: no server, no database, no keys. GitHub Pages serves it for free from a public repository at `https://<your-user>.github.io/<repository>/`.

I have **not** published it for you: that needs your GitHub account. Everything you need is prepared. Pick one of two routes.

## Route A: upload the finished site (no tools to install)

The folder **`deploy/github-pages-site/`** already contains the built site (35 files, 7 MB). It was verified from a sub-folder exactly the way GitHub Pages serves it.

1. Sign in at github.com. Click **New repository**. Name it, for example, `tax-folios-atlas`. Choose **Public**. Create it.
   (Want the shorter address `https://<your-user>.github.io/`? Name the repository exactly `<your-user>.github.io`.)
2. On the empty repository page click **uploading an existing file**.
3. Open the folder `deploy\github-pages-site` in File Explorer, press **Ctrl+A** to select everything inside it (the `assets` folder, `index.html`, `404.html`, `favicon.svg` and `.nojekyll`), and **drag it all into the browser window**. Upload the *contents*, not the folder itself: `index.html` must sit at the top of the repository.
4. Wait for the upload to finish, then click **Commit changes**.
5. Go to **Settings → Pages**. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, and **Save**.
6. After one or two minutes the page shows **Your site is live at…**. Open the link. Done.

To publish a newer version later, run `npm run package:pages` (it rebuilds the folder) and upload again. Route A leaves old hashed files behind, so after a few updates it is tidier to switch to Route B.

## Route B: push the project and let GitHub build it (best for ongoing updates)

Every time you change a rate or a revenue figure, GitHub validates the data, runs the tests, rebuilds and republishes by itself. Bad data blocks the release.

1. Install **GitHub Desktop** (or Git) and create the repository as above.
2. Copy the whole project folder into the repository folder (the included `.gitignore` leaves out `node_modules`, `dist` and the local backups). Commit and push.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
4. Push again (or open **Actions → Deploy to GitHub Pages → Run workflow**). The workflow file is already in `.github/workflows/deploy.yml`.

## What works on the public site, and what does not

- Works: the map, every folio, charts, Fiscal Fighters, deep links (`#/canada/fed-personal-income-tax`) and reload. Fonts, map data and images are bundled with the site.
- The layout editor's **Save** writes files, so it exists only when you run the project on your own computer (`npm run dev`). On the public site `?layout=1` opens a draft mode that stays in the visitor's own browser and can export a JSON file; nothing can change the published site. There is no upload endpoint to abuse: the checks in `npm run verify:deploy` confirm a write attempt is refused.

## Checks worth running before you upload

```bash
npm run validate      # data
npm test              # unit tests
npm run build
npm run verify:deploy # opens the built site from a sub-folder in Chrome and fails on any error
```

## Good to know

- Public repositories get Pages for free; Pages on a private repository needs a paid GitHub plan.
- Pages has soft limits (a 1 GB site, about 100 GB of traffic a month): far above this site's 7 MB.
- To use your own domain, add it under **Settings → Pages → Custom domain** and follow GitHub's DNS note.
- Fonts and map data are bundled, and `npm run verify:deploy` fails if the built site requests anything from another host.
