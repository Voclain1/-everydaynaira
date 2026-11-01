#!/usr/bin/env node
/**
 * Drop finished images into image-inbox/ named after the post slug
 * (e.g. image-inbox/emergency-fund-nigeria.png), then run:
 *
 *   npm run images:optimize
 *
 * For each image this script:
 *  1. checks it is at least 1400px wide, crops to 16:10 at 1920×1200, and saves a WebP to
 *     public/images/posts/<slug>.webp
 *  2. sets `image` and `imageAlt` (from content/image-briefs.json) in the post's front matter, so the photo replaces the
 *     generated cover on cards and the article page
 *  3. moves the original into image-inbox/done/
 *
 * Social share images keep using the generated design so they stay consistent.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import matter from "gray-matter";

const ROOT = process.cwd();
const briefs = JSON.parse(fs.readFileSync(path.join(ROOT, "content/image-briefs.json"), "utf8"));
const MIN_WIDTH = 1400;
const INBOX = path.join(ROOT, "image-inbox");
const OUT = path.join(ROOT, "public/images/posts");
const POSTS = path.join(ROOT, "content/posts");

fs.mkdirSync(INBOX, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(INBOX, "done"), { recursive: true });

const files = fs.readdirSync(INBOX).filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
if (!files.length) {
  console.log("No images in image-inbox/. Name files after the post slug, e.g. emergency-fund-nigeria.png");
  process.exit(0);
}

for (const file of files) {
  const slug = file.replace(/\.[^.]+$/, "");
  const postPath = path.join(POSTS, `${slug}.md`);
  if (!fs.existsSync(postPath)) {
    console.warn(`skip  ${file}: no post with slug "${slug}"`);
    continue;
  }
  const src = path.join(INBOX, file);
  const meta = await sharp(src).metadata();
  if ((meta.width ?? 0) < MIN_WIDTH) {
    console.warn(`skip  ${file}: only ${meta.width}px wide. Export or upscale to at least ${MIN_WIDTH}px so it stays sharp.`);
    continue;
  }
  const dest = path.join(OUT, `${slug}.webp`);
  await sharp(src)
    .rotate()
    .resize({ width: 1920, height: 1200, fit: "cover", position: "attention" })
    .webp({ quality: 84, smartSubsample: true })
    .toFile(dest);

  const raw = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(raw);
  data.image = `/images/posts/${slug}.webp`;
  data.imageAlt = data.imageAlt || briefs[slug]?.alt || data.title;
  fs.writeFileSync(postPath, matter.stringify(content, data));
  fs.renameSync(path.join(INBOX, file), path.join(INBOX, "done", file));
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`done  ${slug}.webp (${kb} KB)`);
}
