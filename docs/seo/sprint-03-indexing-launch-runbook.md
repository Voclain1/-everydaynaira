# EverydayNaira Sprint 03 — indexing and search-result release checklist

Updated 20 November 2026. Preferred site: **https://www.everydaynaira.com**.

## Verified technical state (from a GitHub-hosted live diagnostic)

- Apex `https://everydaynaira.com/` and checked article/section paths return **308 permanent** redirects to the matching www URL.
- Canonical www HTML pages return **HTTP 200** with self-referencing `rel=canonical`.
- `https://www.everydaynaira.com/sitemap.xml` returned 200 and **57 canonical www URLs** on 20 November 2026.
- `robots.txt` returned 200 and references the canonical sitemap.
- Keep existing Vercel domain configuration. Do not add a second redirect rule to Next.js or oscillate canonical hosts.

## Search Console priority

The verified Search Console property is `sc-domain:everydaynaira.com` in the OpenSEO project, a **domain property** covering www and non-www.

Google may retain old non-www URLs in historical indexing records while it processes permanent redirects. Index inspections are historical crawl observations, not live HTTP checks. Verify the Google-selected canonical after recrawl; don't rewrite site canonicals just because an old inspection shows the apex.

**High-value URLs to check or request indexing for (in the Google Search Console URL Inspection UI):**
1. https://www.everydaynaira.com/bank-charges-in-nigeria-explained/
2. https://www.everydaynaira.com/stamp-duty-on-bank-transfer-in-nigeria-explained/
3. https://www.everydaynaira.com/where-to-keep-your-savings-in-nigeria/
4. https://www.everydaynaira.com/tools/
5. https://www.everydaynaira.com/salary-advance-vs-personal-loan-which-one-should-you-take/
6. https://www.everydaynaira.com/bank-transfer-failed-but-debited-in-nigeria/
7. https://www.everydaynaira.com/resources/bank-dispute-checklist/

Use **URL Inspection → Test live URL → Request indexing** only on priorities that need a fresh crawl; requests do not guarantee inclusion. New pages published November 19 may simply need time to be crawled. Review them after 7–14 days before treating a non-indexed state as a persistent technical failure.

Avoid Google's Indexing API for these editorial pages. Google's API is intended for eligible JobPosting and BroadcastEvent-in-VideoObject pages, not general blog posts.

## Other search engines

The OpenSEO IndexNow key file is stored at `public/621ac9c3431a4430aa498429b6318fe9.txt` and resolves to `https://www.everydaynaira.com/621ac9c3431a4430aa498429b6318fe9.txt` after deployment. IndexNow notifies supported search engines such as Bing; **it does not request indexing from Google**. Submit only actual changed/new URLs after the key is live. Verify the provider acknowledgement; it does not guarantee inclusion.

## CTR optimisation

A separate optional `seoTitle` in article front matter allows concise search titles on proven impression pages without changing visible H1, card titles, URLs, photographic covers or article substance. Eight high-impression existing guides have overrides. This is an optimisation experiment, not a promise that Google will use the supplied title.

We shortened descriptions on Start Here, calculators and FCCPC loan-app verification, and corrected the misleading fallback label "Article reviewed" on new posts lacking a reviewed date.

## Backlink programme

See `docs/seo/sprint-02-earned-backlink-outreach.md` for original, unsent editorial pitches. Target relevant original contributions first and credit the free bank-dispute evidence checklist as a public resource where appropriate. Verify each publisher's submission policy. Avoid purchased followed links, artificial anchors, link exchanges and spam directory submissions. Do not send on behalf of the brand without approving the final outreach text and sender.

## Release and verification

1. Pass lint, TypeScript, static SEO tests, production build and rendered SEO checks in GitHub Actions.
2. Verify `Live host and canonical verification` job is green on production.
3. Merge PR after checks pass, then verify Vercel deployment is successful and post-merge CI is green.
4. Verify www live titles and the IndexNow key file return HTTP 200.
5. Submit IndexNow notifications for the November 19 new/updated URLs, and record the tool's actual status.
6. Monitor Search Console performance and canonical/indexing states after data lag. Record weekly verified clicks, impressions, CTR, position, indexed counts and quality backlinks.
