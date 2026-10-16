# Product-image repair r19

The user identified Thunder and Titan as blurry in the homepage fleet strip. Their previous crops contained only 316 × 282 and 303 × 294 source pixels.

## Assets and provenance

- `dist/assets/thunder-restored-r19.webp`: 1254 × 1254, transparent, 674914 bytes.
- `dist/assets/titan-restored-r19.webp`: 1254 × 1254, transparent, 577354 bytes.
- Built-in image_gen edited the supplied `robot-matrix-original-r18.jpg`. Prompts are in `product-image-prompts-r19.json`.
- These are AI-restored presentation illustrations, not newly obtained high-resolution photographs. Fine hardware textures and decal details are reconstructed; they must not be treated as engineering evidence. Main silhouettes, leg/wheel count, poses and distinctive sensors were visually checked against the original. Side branding is DOSO, matching the requested website brand. The original company images remain retained.
- Orix and Explorer continue to use their higher-resolution original company artwork.
- PNG to WebP is lossless for all visible pixels, with exact alpha parity; only invisible RGB values under fully transparent pixels may differ.

## Integration

The shared robotArt renderer updates homepage fleet, product cards and dialogs, and technology architecture images in both languages. New asset names and script/style fingerprints avoid stale cached versions. The cap based on the old 300px crops has been replaced with a 600px presentation cap, below the new 1254px native resolution.

## Validation

- node --check, build-pages.cjs, 96 language routing cases, static audit of 12 pages / 300 links / 138 asset references, and git diff --check passed.
- Browser visual inspection: 1440px Chinese homepage fleet and Thunder dialog; 390px English homepage fleet and Titan dialog; English language switch and no page overflow on the checked product page.
- No product specification or navigation behavior changed.

