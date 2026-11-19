import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import sharp from "sharp";

const manifest = JSON.parse(fs.readFileSync("image-inbox/sprint2/review_manifest.json", "utf8"));
assert.equal(manifest.length,12,"Approved set must contain twelve photos");
for (const photo of manifest) {
 const input = path.join("public/images/posts",photo.webp_filename);
 assert.equal(photo.webp_filename,photo.article_slug+".webp","Unexpected image path");
 const b = fs.readFileSync(input);
 assert.equal(crypto.createHash("sha256").update(b).digest("hex"),photo.sha256,"Approved photo changed: "+photo.article_slug);
 const meta=await sharp(b).metadata();
 assert.equal(meta.format,"webp","Only optimised WebP allowed: "+photo.article_slug);
 assert.equal(meta.width,1920,"Incorrect width: "+photo.article_slug);
 assert.equal(meta.height,1200,"Incorrect height: "+photo.article_slug);
 console.log("Verified "+photo.article_slug+" ("+b.length+" bytes)");
}
console.log("PASS: all twelve publisher-approved 1920x1200 images match their SHA-256 hashes");
