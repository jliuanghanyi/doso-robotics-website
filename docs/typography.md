# Website typography

The site uses self-hosted variable **Inter** for Latin text and numerals and
**Noto Sans SC** for Chinese. Headings and controls use weight 600, English section
labels use 500, and body copy uses 400. Both font files are actually preloaded;
system Chinese sans-serif fonts cover characters outside the Chinese subset.

The shared scale is h1 36–56px / 1.2, h2 26–36px / 1.35, h3 21px / 1.45.
Body copy is 16px / 1.75 in #475569; leads are 18px; auxiliary copy is 14px in
#64748B. English section labels are 12px with 0.12em tracking, while the Chinese
brand label keeps normal spacing. Compact architecture labels use 18px, and
card headings use the 21px subheading scale. Light text is retained on photo overlays.

Product numbers use lining tabular numerals. Number and unit spans share the
same text content, with the unit at a lighter weight and no smaller than 14px
in comparison tables. The DOSO logo remains the original image asset.

Inter provenance and license are recorded in `dist/assets/fonts/README.md` and
`dist/assets/fonts/Inter-OFL.txt`. The additional Latin WOFF2 is about 111 KB.

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
