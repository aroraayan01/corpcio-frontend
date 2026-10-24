# Corpcio website

Static site: home page plus Terms of Service, Privacy Policy, Refund & Cancellation Policy and Privacy Choices / Opt-Out, built for Stripe account review.

## Fill in, build, upload

1. Put the real company details in `site.config.json`. Every empty field shows as a yellow `[placeholder]` on the pages.
2. `node build.mjs` writes the finished site to `dist/`. Run `node build.mjs --strict` for the final build; it refuses to build while any field is empty.
3. Commit **including `dist/`** and push. `dist/` is committed on purpose: the server only copies it and never needs Node.

## Deploying from GitHub (cPanel)

One-time, in the corpcio.com cPanel → **Git Version Control** → Create: clone this repo into e.g. `/home/<user>/repositories/corpcio-site` (not into `public_html`). A private repo needs an SSH deploy key: cPanel → SSH Access → generate a key, then add the public key on GitHub → repo Settings → Deploy keys (read-only).

Every deploy after that: push to `main`, then in Git Version Control → Manage → **Pull or Deploy** → *Update from Remote*, then *Deploy HEAD Commit*. `.cpanel.yml` copies `dist/` into `public_html`.

Edit pages in `src/`, never in `dist/` (it is wiped on every build). `{{key}}` inserts a config value and `{{> name}}` inserts `src/partials/name.html`.

## Keep the site and Stripe consistent

- The legal name, address, support email and phone must match what is entered in the Stripe account.
- Set the Stripe statement descriptor to the `statementDescriptor` value; the site tells customers that is what their statement will show.
- The site sets no cookies and loads nothing from third parties. If you add analytics or embeds later, update the Privacy Policy's cookies section, and add a consent banner if visitors from the EU or UK are expected.
