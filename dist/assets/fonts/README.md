# Local font assets

## Inter

- File: `inter-latin-variable-r26.woff2`
- Upstream: Inter 4.1, https://rsms.me/inter/
- Original binary: https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1
- License: `Inter-OFL.txt`, copied from https://raw.githubusercontent.com/rsms/inter/v4.1/LICENSE.txt
- SIL Open Font License 1.1; copyright 2016 The Inter Project Authors.
- Subset: Latin/Latin-1, common punctuation, supported arrows and currency symbols; 309 encoded characters.
- Variable axes retained: weight 100-900, optical size 14-32.
- All applicable OpenType layout features retained, including `tnum`.
- The `tnum` advances of all ten digits were verified equal at weights 400, 500 and 600.
- Self-host the file; no external font service is needed at runtime.

## Noto Sans SC

- File: `noto-sans-sc-site-r21.woff2`, unchanged.
- Upstream: https://github.com/google/fonts/tree/main/ofl/notosanssc
- License: `OFL.txt`, SIL Open Font License 1.1.
- Variable weight range 100-900; 605 encoded characters.
- Verified against current app.js and site-metadata.json: all 486 Han characters covered.
- System sans-serif fallback remains useful for future Chinese characters outside this subset.
