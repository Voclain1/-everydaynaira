# Image workflow

Two layers, so a post is never published without an image, and your best posts get real photography.

## Layer 1 — Generated covers (automatic)

Every post gets an isometric cover drawn in code by `lib/iso.ts`, in the site's design system.
The topic picks the composition; the post slug seeds small variations. These are used whenever
a post has no photo, and always for social-share images (`/og/<slug>/`), so links on WhatsApp,
X and LinkedIn look consistent.

## Layer 2 — Natural editorial photos (your chosen standard)

The goal is images that look like a real photographer shot them in Nigeria: natural light,
real homes, markets and offices, true skin tones, nothing glossy or "AI-looking".

### 1. Get the prompt

```bash
npm run images:prompts            # all posts
npm run images:prompts -- <slug>  # one post
```

This writes `docs/image-prompts.md`. Each prompt combines:

- a **scene brief** written for that post (in `content/image-briefs.json`), and
- one **shared photographic style** (35mm lens, natural light, muted true-to-life colour,
  fine grain, unposed, no readable text or logos), plus an **avoid list**.

Keeping the style block identical across every image is what makes the whole site look like one
photo series.

### 2. Generate

Use the strongest photorealistic model you have access to, at **16:10**. Settings for common tools
are at the top of `docs/image-prompts.md` (for Midjourney: `--ar 16:10 --style raw --stylize 50`).
Generate at least 4 options per post.

### 3. Pick ruthlessly — the realism checklist

Reject an image if any of these fail. Zoom to 100% before deciding.

- **Hands:** five fingers, natural joints, holding objects convincingly.
- **Faces:** if visible, natural skin texture (pores, small imperfections), no waxy shine, not
  staring into the camera. Over-the-shoulder, side-on, or hands-only shots look most natural.
- **Text:** no garbled letters anywhere — screens, receipts, signs, notes. Blurred is fine; fake
  letters are not.
- **Money:** naira notes should look like naira (colours and proportions), not dollars or
  invented currency. If they don't, regenerate or crop them out.
- **Setting:** clearly Nigerian — architecture, clothing, plugs, products, light. Reject anything
  that looks like a Western suburb or a stock-photo studio.
- **Light:** one consistent light source with soft, believable shadows. Reject HDR glow or
  "too perfect" lighting.
- **Logos:** no real bank or brand logos.

### 4. Finish and publish

Save the chosen image as `image-inbox/<post-slug>.png` (or .jpg), then:

```bash
npm run images:optimize
```

The script rejects anything narrower than 1400px (upscale it first in your tool if needed), crops to
16:10 at 1920×1200, saves a compressed WebP in `public/images/posts/`, and adds `image:` and
`imageAlt:` to the post's front matter using the alt text from the brief. Commit and push; the
photo replaces the generated cover on cards and on the article.

To go back to the generated cover, delete the `image` and `imageAlt` lines from the post.

### New posts

Add a brief to `content/image-briefs.json` when you write the post:

```json
"your-post-slug": {
  "scene": "who is doing what, where, with which objects, and the light",
  "alt": "A plain description of the photo for screen readers"
}
```

Good briefs describe one real moment (a trader sending a transfer at her stall), name concrete
Nigerian details (generator, POS terminal, danfo, prepaid meter token), and keep screens and
paperwork blurred so no fake text appears.
