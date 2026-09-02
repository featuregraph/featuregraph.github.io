# featuregraph.ai

The public marketing and research site. Hand-written HTML, CSS and JS — no build
step, no framework, no package manager.

## Merging deploys

`featuregraph.ai` is served **directly by GitHub Pages**: the apex A records
point at `185.199.108–111.153` with no CDN in front. A merge to `main` is live
in about a minute. There is no staging environment, so review the diff as if it
were the deploy, because it is.

`CNAME` holds `featuregraph.ai`. `www` is a CNAME to `featuregraph.github.io`.

## The other hostname is not this repository

`assistant.featuregraph.ai` is a **separate application**: a Python server in
`featuregraph/featuregraph` under `apps/assistant`, deployed to Fly.io, with its
`assistant` CNAME pointed there from the IONOS DNS panel. Nothing in this
repository serves it. Its predecessor was an OpenAI ChatGPT Site whose source
was never committed and could not be recovered, which is why the replacement
lives in a repository with tests.

DNS for the whole domain is at **IONOS**, not Cloudflare.

## Two Read the Docs projects, and they are easy to confuse

- `featuregraph-framework.readthedocs.io` — the **framework**. This is what the
  site's "Documentation" links should point at.
- `featuregraph.readthedocs.io` — the **research record**.

The shorter, more obvious URL belongs to the research record, not to the
framework this site is about. Both repositories also once published a Python
package named `featuregraph` at the same version — since resolved, the research
one is now `featuregraph_research` — and between the two, every "Documentation"
link on this site pointed at the research record for months.

The package half is fixed; this half is not, and cannot be without renaming a
published Read the Docs project. Nothing 404s when a link points at the wrong
one — readers simply land somewhere else — which is exactly why it went
unnoticed. Check where a docs link goes, not whether it resolves.

## Working conventions

- Topical branch per change, PR into `main`. Do not push to `main`.
- Check external links against the repository they point into before changing
  them; the `blob/main` paths into `featuregraph/featuregraph` are real files
  and can go stale.
- Keep it dependency-free. If a change seems to need a build step, it probably
  belongs in a different repository.
