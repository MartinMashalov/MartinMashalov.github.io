# martinmashalov.com

My personal site. Three static files — `index.html`, `styles.css`, `main.js`. No build
step, no framework, no dependencies beyond three webfonts.

## Run it locally

```bash
python3 -m http.server 8791
# open http://127.0.0.1:8791
```

## Notes on the design

The page is laid out on a visible twelve-column construction grid, a nod to the Dutch
modernist tradition I spent two years living next to while doing my MSc in Amsterdam.

The headline decodes out of `[MASK]` tokens on load. That is not a generic text effect:
it is a twelve-step cosine schedule revealing tokens in shuffled order, which is what
non-autoregressive decoding in a masked diffusion language model actually looks like — the
subject of my thesis. The step counter under the headline reports the real state of the
schedule. It respects `prefers-reduced-motion`, and the page renders completely with
JavaScript disabled.

## Deploying

See [`../HOSTING.md`](../HOSTING.md). Short version: Cloudflare Pages, $0/month, connect the
repo and set the build output directory to `/`.

## Licence

Code MIT. Written content and design are © Martin Mashalov.
