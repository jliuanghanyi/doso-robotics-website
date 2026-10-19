# Website typography

The site uses a self-hosted subset of **Noto Sans SC**, with its variable weight
axis retained. Headings use weight 650, subheadings and controls use 600, and body
copy uses 400. System Chinese sans-serif fonts cover characters outside the subset.

Upstream font and license: https://github.com/google/fonts/tree/main/ofl/notosanssc

`dist/assets/fonts/OFL.txt` contains the upstream SIL Open Font License.
The unmodified upstream variable TTF is not included in the deployment.

To regenerate after significant copy changes, download the upstream
`NotoSansSC[wght].ttf`, install `fonttools[woff]`, and run:

```sh
python scripts/subset-font.py /path/to/NotoSansSC-variable.ttf
node build-pages.cjs
```

The subset includes the Chinese and English copy in `dist/app.js`, site metadata,
and printable ASCII. All pages preload the same WOFF2 to reduce layout shifts.
