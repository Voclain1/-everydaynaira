# EverydayNaira: Sprint 02 — long-tail topical authority plan

Research and draft date: **19 November 2026** (Africa/Lagos). Scope: 12 additional original Nigeria-focused guides; total after future approval and publication **38 guides**. This is **not a claim that the pages are live**.

## Grounding and ranking methodology

- The site has six established hubs. This sprint deepens their distinct reader intents rather than creating near-identical variations of the Sprint 01 guides.
- Nigeria-localised monthly searches and keyword difficulty are **not verified**. Ubersuggest Nigeria (locId 2566) returned an HTTP 403 daily-report quota error. No numerical search-volume or difficulty estimates have been invented. A paid plan at https://ubersuggest.com/en/pricing raises daily limits, or research can be resumed when reporting resets.
- Actual site search clicks and impressions cannot be measured in this workspace because EverydayNaira's Search Console property is not connected to available reporting integrations. Connect and verify https://www.everydaynaira.com, including domain-property data, for publication and query tracking.
- Search intent, regulatory authority, ability to answer a distinct reader problem and usefulness for contextual internal links drive the present ranking. Current regulatory claims must be traced to original CBN/FCCPC sources, not competitor snippets.

## Long-tail research map and distinct search intent

| Priority | Intended query family | Article slug | Reader job, distinct from existing pillars |
| --- | --- | --- | --- |
| P0 | ATM debited but no cash dispensed Nigeria | atm-debited-but-no-cash-dispensed-in-nigeria | ATM non-dispense and partial dispense, CBN March 2026 24h/48h rules, not NIP |
| P0 | how to find NIP session ID Nigeria | how-to-find-nip-session-id-for-bank-transfer-in-nigeria | Find/reference outgoing NIP transfer; not duplicating the failed-transfer dispute itself |
| P0 | how to check if loan app is approved in Nigeria | how-to-check-if-a-loan-app-is-approved-in-nigeria | Current FCCPC register, legal operator matching, July 2026 enforcement clarification |
| P0 | report loan app harassment Nigeria | how-to-report-loan-app-harassment-in-nigeria | Contact shaming, debt-collection evidence, FCCPC and NDPC channels |
| P0 | sent money to scammer Nigeria what to do | what-to-do-after-sending-money-to-an-online-scammer-in-nigeria | Authorised payment induced by deception; not unauthorised debit or mistyped account |
| P1 | fake bank customer care number Nigeria | how-to-identify-fake-bank-customer-service-numbers-in-nigeria | Search ads, lookalike links and WhatsApp fake support |
| P1 | how to save school fees every term Nigeria | how-to-save-for-school-fees-every-term-in-nigeria | Separate school-term deadlines; not a general annual rent savings plan |
| P1 | emergency fund irregular income Nigeria | how-to-build-an-emergency-fund-with-irregular-income-in-nigeria | Slow-week savings baseline and good-week top-ups; not general budgeting on irregular wages |
| P1 | how to record daily sales expenses Nigeria | how-to-record-daily-sales-and-expenses-in-a-small-nigerian-business | Daily ledger, turnover versus profit; not a general article on separating accounts |
| P1 | weekly cash-flow forecast small business Nigeria | weekly-cash-flow-forecast-for-small-business-in-nigeria | Forward-looking collections/payments, not daily historical bookkeeping |
| P2 | budget transport costs Lagos salary | how-to-budget-transport-costs-in-lagos-on-a-salary | Route-specific fare maths, not falsely claimed representative fares |
| P2 | December spending budget Nigeria | how-to-plan-december-holiday-spending-on-a-nigerian-salary | Seasonal expenses and January protection, separate from evergreen monthly budget |

### Competitor and SERP qualitative references

Representative relevant articles found in current web research include:
- https://www.mypryme.com/blog/save-for-school-fees-nigeria
- https://www.aminihq.com/blog/school-fees-savings-plan-nigeria
- https://www.mypryme.com/blog/how-to-calculate-loan-interest-nigeria
- https://businessday.ng/backpage/article/school-fees-are-not-a-surprise-stop-paying-them-like-one/

These are examples of competing search intent and possible quality benchmarks. They are **not evidence of ranking position or search demand**. No wording, proprietary research or photos should be copied.

## Important current primary-source findings

1. **CBN March 2026 ATM guidelines:** https://www.cbn.gov.ng/Out/2026/CCD/ATM%20Guidelines.pdf supersede older ATM operations requirements. Failed on-us ATM withdrawal: instant reversal, or manual reversal no later than 24 hours where instant reversal fails; failed not-on-us: refund period maximum 48 hours. Earlier generic 72-hour FAQs should not override this current 2026 instrument. Human review of the guideline's more compressed processing benchmark wording remains advisable.
2. **FCCPC 2025 DEON digital-lending regulations:** https://fccpc.gov.ng/wp-content/uploads/2025/08/DIGITAL-CONSUMER-LENDING-2025-LATEST.pdf . The FCCPC says the April/May 2026 suspension was lifted on 20 July 2026: https://fccpc.gov.ng/fccpc-resumes-digital-lending-regulation/ . The old suspension notice is historical, not current standing.
3. **FCCPC digital-lender register:** https://fccpc.gov.ng/registration-of-digital-money-lenders/approvals-of-dmls/ . Check live at editorial review and avoid naming individual apps as approved without current proof.
4. **FCCPC complaints and privacy reporting:** https://fccpc.gov.ng/consumers/complaint-handling/ and https://services.ndpc.gov.ng/breach/ . Do not imply a complaint automatically cancels a valid debt.
5. **CBN fraud awareness:** https://www.cbn.gov.ng/supervision/cpdfraudandscam.html . Distinguish a successful transfer obtained through deception from an entirely unauthorised debit.

## Content and navigation implementation

- The **12** draft posts exist in `content/posts/` and are connected from six topic hubs.
- Add contextual crosslinks from established pillar pages, including bank disputes, scams, school fees, income and budgeting.
- The homepage latest section should render 12 new items after publication. The `/guides/` archive dynamically lists all **38** posts.
- Standalone **bank-dispute evidence checklist and complaint letter** at `/resources/bank-dispute-checklist/` provides a useful resource for finance reporters, consumer-rights educators and genuine editorial citations.
- It is an interactive print-friendly checklist; no personal banking details are requested. This resource must remain free without a signup.
- The sitewide sitemap and search index must include the checklist, and all 12 new posts must appear in canonical sitemap, RSS, search and guide archive.

## Hard editorial release gates

**Do not merge/publish before all gates pass.**
- 12 distinct relevant **real-life Nigerian editorial photographic covers** shown to and explicitly approved by the publisher (previously agreed). Each full-size asset must be optimised to 1920 × 1200 WebP and tracked in front matter with accessibility alt text.
- All banking, loan, money-safety and other high-impact financial claims reviewed against linked official documents. Do not misrepresent draft instruments or historical injunction status.
- Check worked numeric examples for internal consistency; all income/fare/school figures are labelled as illustrative.
- No invented credentials, expert review badges, keyword search volumes, backlink acquisitions or guaranteed transaction refunds.
- Static SEO guard and production-build/route tests green; no internal redirects or missing sources/images.
- PR opens as **draft** until photo approval and checks pass. A successful code build alone is not clinical/legal/financial sign-off.

## Measurement after publication

Within 24 hours: verify each page returns 200, canonical to www domain, WebP images resolve, mobile tables scroll, guides archive displays 38, sitemap, RSS and search index cover all 12.

Weekly: use Google Search Console to record new non-brand impressions, clicks, indexed/not indexed pages, query clusters and click-through rates. Use Ubersuggest only for supplementary estimates, never to fabricate actual click data.

Month 2–3: seek legitimate editorial references, track source URL/target/link attribute once published, and revise articles based on queries and reader problems. No ranking or backlink outcome is guaranteed.
