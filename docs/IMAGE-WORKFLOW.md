# Image workflow

EverydayNaira uses no stock photos. Every image comes from one visual system, so the
site looks consistent no matter how many posts you publish.

## Layer 1 — Generated covers (automatic, zero effort)

Every post gets an isometric cover drawn in code by `lib/iso.ts`.

- The **topic** picks the composition: budgeting splits, a rising savings staircase,
  a vault with stacks of notes, debt blocks being paid down, uneven income bars, and a
  protected block for money safety.
- The **post slug** seeds small variations (heights, which block is lime, number of
  steps), so no two covers are identical.
- The same art is used for cards, article headers, topic pages, and the 1200×630
  social-share images (`/[slug]/opengraph-image`). Nothing to upload, nothing to resize.

Publishing a new post therefore needs **no image work at all**.

## Layer 2 — Rendered hero images (optional, for flagship posts)

When a guide deserves a richer image (your top traffic posts, pillar content):

1. Run `npm run images:prompts` (or `npm run images:prompts -- <slug>` for one post).
   This writes `docs/image-prompts.md` with an art-directed prompt per post. Every
   prompt shares one style block, so images from different days still match.
2. Paste the prompt into your image tool (Midjourney, Ideogram, Flux, ChatGPT).
   Generate 4, pick the cleanest one with the most empty space.
3. Save it as `image-inbox/<post-slug>.png`.
4. Run `npm run images:optimize`. It crops to 16:10, resizes to 1600px, saves a WebP
   to `public/images/posts/`, and adds `image:` and `imageAlt:` to the post's front
   matter automatically.
5. Edit `imageAlt` in the post to describe the picture properly, then commit and push.

To go back to the generated cover, delete the `image` and `imageAlt` lines.

### Quality checklist before you commit an image

- Matches the palette: off-white, stone, charcoal, one lime accent. Reject anything with
  extra colours, gradients, or glossy plastic.
- No text, logos, bank brand names, or faces.
- Subject sits in the middle 60% (cards crop the edges on small screens).
- File under 200 KB after optimising (the script prints the size).

## Social images

Share images are always generated, so links on WhatsApp, X, and LinkedIn look uniform.
Preview any of them at `https://everydaynaira.com/<slug>/opengraph-image`.
