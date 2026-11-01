#!/usr/bin/env node
/**
 * Drop finished images into image-inbox/ named after the post slug
 * (e.g. image-inbox/emergency-fund-nigeria.png), then run:
 *
 *   npm run images:optimize
 *
 * For each image this script:
 *  1. crops to 16:10, resizes to 1600px wide, and saves a WebP to public/images/posts/<slug>.webp
 *  2. sets `image` and `imageAlt` in the post's front matter, so the photo replaces the
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
  const dest = path.join(OUT, `${slug}.webp`);
  await sharp(path.join(INBOX, file)).resize({ width: 1600, height: 1000, fit: "cover", position: "attention" }).webp({ quality: 82 }).toFile(dest);

  const raw = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(raw);
  data.image = `/images/posts/${slug}.webp`;
  data.imageAlt = data.imageAlt || `Illustration for: ${data.title}`;
  fs.writeFileSync(postPath, matter.stringify(content, data));
  fs.renameSync(path.join(INBOX, file), path.join(INBOX, "done", file));
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`done  ${slug}.webp (${kb} KB)`);
}
