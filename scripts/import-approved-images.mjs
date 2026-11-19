import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

const entries = [["bank-transfer-failed-but-debited-in-nigeria","9ac59cdf-c0a5-4771-8386-4b1c1fbc27b3","d1ba73669e3d53216f173364d5f30c7c7d80e451d0f22e8e09803a44d287c604"],["how-to-reverse-money-sent-to-wrong-account-in-nigeria","0b4e5774-9a27-4e68-9e0a-0970ffb067fa","703e42021b8880ff6fb422a255345a4e4c1df9a377750202b01886e3ecde75cb"],["how-to-report-a-bank-to-cbn-in-nigeria","d5ad06a9-9ae2-481f-b98c-bb4b6945577f","418cd5c301ff293df4073211fe872c3a0b9aa712ef6dcdb81186c77458afc564"],["sms-alert-charges-in-nigeria","0c42f2b3-9de8-4022-ba12-890805f1dd3b","1d19b35fd8d0f71f39b2ab9008d8324978d0dd15f6f775ae04b5790b23dadb7a"],["how-to-budget-150000-to-250000-naira-salary-in-nigeria","4622e596-aa00-43d3-962b-b7717e3090e2","56777bd2adf8ee433be093538b3a82549c93cdc83ef2145e7f87632854bb7911"],["how-to-budget-when-paid-daily-or-weekly-in-nigeria","e38d3524-16c8-450d-b898-e8e53fc4ef07","7212b5ae17b37e174688151454a638363a1e696e7c966b64848d049d769354a8"],["how-to-save-for-annual-house-rent-in-nigeria","a679acb4-1dfb-4389-bfcb-9ca8a6d05b9a","95422773920703a5c137822fe4f5d3ae0e0e398869c97cf0835b658a4761dbbd"],["flat-rate-vs-reducing-balance-loan-interest-in-nigeria","b260fd12-381e-4995-a44f-4914af976764","22b59b82029c0deb8cd468e47edb6d07a561f8afaff7f4bb7a449266441257cb"]];
const prefix = "https://d2ol7oe51mr4n9.cloudfront.net/user_3Db11lqrglC1NxdVgV0iTlBiTDs/";
await fs.mkdir("public/images/posts", { recursive: true });
for (const [slug, id, expectedSha] of entries) {
  const response = await fetch(prefix + id + ".png", { signal: AbortSignal.timeout(40000) });
  if (!response.ok) throw new Error(`${slug}: source download HTTP ${response.status}`);
  const png = Buffer.from(await response.arrayBuffer());
  const sha = crypto.createHash("sha256").update(png).digest("hex");
  if (sha !== expectedSha) throw new Error(`${slug}: downloaded source differs from approved image (sha256 ${sha})`);
  const info = await sharp(png).metadata();
  if (info.width < 1400 || info.height < 800) throw new Error(`${slug}: inadequate source dimensions`);
  const output = "public/images/posts/" + slug + ".webp";
  await sharp(png).rotate().resize({ width: 1920, height: 1200, fit: "cover", position: "attention" })
    .webp({ quality: 84, smartSubsample: true }).toFile(output);
  const processed = await sharp(output).metadata();
  if (processed.width !== 1920 || processed.height !== 1200 || processed.format !== "webp")
    throw new Error(`${slug}: image output validation failed`);
  console.log(`Imported verified photo for ${slug}: ${png.length} source bytes`);
}
console.log("All eight approved images imported.");
