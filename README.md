# EverydayNaira

The everydaynaira.com site, rebuilt from WordPress as a static-first Next.js app.

- **Same URLs.** Every post and page lives at the same `/slug/` address as on WordPress.
  Category archives, author pages, feeds, Rank Math sitemaps, and `?p=123` links
  301-redirect to their new homes (`next.config.ts`). Internal links that were broken on
  the old site now point to the right guide.
- **Same content, cleaned up.** Posts are Markdown in `content/posts/`, with the Rank Math
  meta description, focus keyword, tagline, key takeaways, and sources carried over.
- **Better SEO.** BlogPosting, FAQPage, BreadcrumbList, HowTo, CollectionPage, Person, and
  Organization schema; generated social images; sitemap; RSS; canonical URLs.
- **Features.** Four naira calculators, instant search (press `/`), newsletter sign-up,
  contact form, and an image workflow: generated covers by default, natural editorial photos for posts you choose (see `docs/IMAGE-WORKFLOW.md`).

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in what you need
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel

1. Import this repository at vercel.com/new. Framework preset: Next.js. No build settings to change.
2. Add the environment variables from `.env.example` under Project → Settings → Environment Variables.
3. Deploy, then open the preview URL and run `npm run check:urls -- https://<preview-url>`
   to confirm every old WordPress URL resolves.
4. Point the domain: Project → Settings → Domains → add `everydaynaira.com` and
   `www.everydaynaira.com` (redirect www to the apex). Update DNS at your registrar to the
   records Vercel shows.
5. In Google Search Console, submit `https://everydaynaira.com/sitemap.xml`.

## Moving to a VPS later

Nothing is Vercel-specific. On any server with Node 20+:

```bash
npm ci && npm run build
npm start -- -p 3000          # run behind Nginx/Caddy, managed by pm2 or systemd
```

## Writing a new post

Create `content/posts/<slug>.md`:

```markdown
---
title: "How to …"
slug: "how-to-…"
date: "2026-11-05T09:00:00+01:00"
updated: "2026-11-05T09:00:00+01:00"
category: "savings"          # budgeting | savings | banking | debt | income | money-safety
tags: ["How-To Guide"]
author: "benedict"
description: "Meta description, 140–160 characters."
tagline: "The one-paragraph summary shown under the title."
focusKeyword: "…"
keyTakeaways: ["…", "…"]
sources: ["cbn-guide-charges-2026", "nigeria-tax-act-2025"]   # keys from content/sources.json
calculator: "emergency-fund-calculator"   # optional: budget-, emergency-fund-, savings-goal-, loan-calculator
---

Sources are keys from `content/sources.json`, so every source is written once with its publisher, title and link, and shows as a numbered, linked list under the article. To cite something new, add an entry there first:

```json
"new-source-key": { "publisher": "Central Bank of Nigeria", "title": "Exact document title", "url": "https://…", "date": "2026" }
```

The build warns about any key it cannot find.

Body in Markdown. Use `##` for sections (they build the table of contents) and a
`## FAQ` section with `### Question?` headings to get FAQ rich results.
```

Commit and push; Vercel rebuilds automatically. The cover image is generated for you.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, `https://everydaynaira.com` |
| `BREVO_API_KEY`, `BREVO_LIST_ID` | Newsletter sign-ups go to this Brevo list |
| `NEWSLETTER_WEBHOOK_URL` | Alternative: post sign-ups to any webhook |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form email delivery |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | e.g. `ca-pub-3739323622674325` to load AdSense auto ads |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |

`public/ads.txt` is already in place for AdSense.
