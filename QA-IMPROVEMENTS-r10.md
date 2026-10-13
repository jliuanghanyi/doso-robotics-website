# DOSO r10 validation — 2026-10-13

Implemented in requested order: comparison, images, case-evidence review, bilingual copy, sharing metadata, contact-flow clarity.

## Source and content

- Compared product figures with company PDF page 4; Orix step height remains "not specified". Climbing height difference is not mislabeled as step height.
- Application distinctions follow pages 9–10; no invented exclusion of Explorer features from Thunder.
- Orix source extraction correctly applies original PDF soft mask (transparent corners); deployed asset is byte-identical to the corrected extraction. Explorer uses a larger original PDF image window. Thunder and Titan retain supplied screenshot pixels.
- No supplied customer evidence or receiving contact address: real customer case and real submission remain pending. Illustrations are labeled and request downloads explicitly say they have not been sent.

## Checks

- Build prerenders 12 distinct Chinese/English pages; JS syntax and Git whitespace checks pass.
- 96 language-route cases pass (explicit choice, saved preference, query/path conflicts, normalized routes, subdirectory and anchors).
- Static audit passes 298 links, 132 asset references, route fragments, fingerprints, English copy and product figures.
- All 12 documents checked at 320, 390, 1024 and 1280 CSS pixels (48 combinations): no page horizontal overflow, untranslated English main content, broken loaded images or clipped product/technology/platform cards. Comparison table intentionally scrolls inside its labeled region.
- Fixed one English product-card height issue found during QA. Header logo, navigation and actions have matching x positions across six desktop pages.
- Tested English mobile menu navigation, four comparison buttons and product dialogs, Explorer-to-brief prefill, Chinese/English toggles retaining form contents, and actual TXT download. Downloaded file contains Explorer and the tested draft, with a clear no-submission statement.
- Independent review confirms 12 static and 12 runtime metadata sets match site-metadata.json; canonical and language alternate links are query-free and page-specific.

## Remaining inputs

Real public project context and verified results; official receiving email, phone or form endpoint; larger independent Thunder/Titan product images. No placeholders are presented as real business facts.
