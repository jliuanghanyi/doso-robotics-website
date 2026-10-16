# Image quality audit — 2026-10-15 (r18)

Reviewed every active image source across the six pages and both languages, including CSS backgrounds, SVG crop windows, product dialogs, scenario cards and architecture thumbnails.

## Changes

- Replaced screenshot-sized technology artwork with standalone high-resolution illustrations. All 12 architecture tiles now use clear standalone artwork (four existing scenario images plus eight technical illustrations); none magnifies the old design screenshot.
- Restored the home hero scenery and extracted/restored the about landscape. The home hero remains 1672 × 941; its surface/edge restoration should not be described as a native resolution increase. The about crop increased from 817 × 388 to 1821 × 864.
- Thunder and Titan now use the original embedded PDF JPEG instead of a screenshot of a PDF viewer. Orix and Explorer retain their original source pixels. Product SVGs are bounded to native crop widths to avoid additional enlargement. Titan's crop excludes the nearby blue diagram marker.
- Rejected the two AI-enhanced product candidates because the lettering/detail fidelity was insufficient. They are not used on the website. Genuine high-resolution Thunder/Titan product photos remain needed for a substantial product-detail improvement; the PDF only contains flattened, approximately 300-pixel robot artwork.
- Kept the already-clear 1586 × 992 scenario images, 2172 × 724 courtyard and reality-to-simulation backgrounds, and 500 × 142 logo. Their intentional depth-of-field/gradient softness is not compression damage.
- Adjusted desktop and mobile hero sizing to preserve the full robot and reduce unnecessary enlargement. Kept a soft transition between mobile copy and photo.
- Preserved all existing product specifications, navigation, language behavior and contact limitations.

## Asset delivery

Visual restoration used the built-in image_gen tool. Exact prompts, source images and project paths are in [image-prompts-r18.json](image-prompts-r18.json). Original inputs remain unchanged. Generated PNG masters are preserved locally in C:/Codex/co/site-artifacts/images-r18-originals/.

All 12 accepted generated assets were losslessly encoded as WebP at their original dimensions. Decoded RGBA bytes were compared and matched for every file. Total generated-image bytes: 21,736,037 → 14,712,886 (32.3% smaller). This encoding does not sharpen, resize or alter pixels.

| Project asset | Pixels | WebP bytes |
| --- | --- | --- |
| dist/assets/about-landscape-hd-r18.webp | 1821 × 864 | 1,642,612 |
| dist/assets/hero-restored-r18.webp | 1672 × 941 | 1,549,990 |
| dist/assets/simulation-hd-r18.webp | 1729 × 910 | 939,894 |
| dist/assets/task-data-hd-r18.webp | 1727 × 911 | 1,462,234 |
| dist/assets/technology-hero-hd-r18.webp | 2037 × 772 | 1,666,722 |
| dist/assets/world-hd-r18.webp | 1983 × 793 | 1,233,816 |
| dist/assets/control-hd-r18.webp | 1774 × 887 | 908,226 |
| dist/assets/decision-hd-r18.webp | 1774 × 887 | 951,614 |
| dist/assets/feedback-hd-r18.webp | 1774 × 887 | 996,200 |
| dist/assets/perception-hd-r18.webp | 1774 × 887 | 1,100,286 |
| dist/assets/planning-hd-r18.webp | 1774 × 887 | 980,668 |
| dist/assets/training-hd-r18.webp | 1774 × 887 | 1,280,624 |

## Verification

- Browser: all 12 localized documents at 1440, 390 and 320 pixels wide (36 checks); no document overflow or broken loaded images. Desktop and phone screenshots checked for image crops and complete robot silhouettes.
- Technology architecture: all standalone thumbnails visibly loaded and their natural dimensions inspected.
- Mobile Chinese/English toggles and navigation opened successfully; headings and selected language agreed.
- node --check dist/app.js, build-pages.cjs, 96 language routing cases, static links/assets audit and git diff --check passed.

These are illustrative scenes, not photographs documenting customer deployments. Product photographs retain their authentic source artwork.
