import { getAllDocPages, getAllPosts } from "@/lib/content";
import { TOPICS, topicByCategory } from "@/lib/topics";

export const dynamic = "force-static";

export function GET() {
  const docs = [
    ...getAllPosts().map((p) => ({
      t: p.title,
      u: `/${p.slug}/`,
      c: `Guide · ${topicByCategory(p.category).name}`,
      d: p.tagline || p.description,
      h: [p.focusKeyword, ...p.toc.map((t) => t.text)].join(" "),
      b: p.plain.slice(0, 6000),
      k: "guide",
    })),
    ...TOPICS.map((t) => ({ t: `${t.name} guides`, u: t.hub, c: "Topic", d: t.summary, h: t.starters.map((s) => s.label).join(" "), b: t.description, k: "topic" })),
    ...[
      ["budget-calculator", "Budget calculator", "Split your monthly income into categories."],
      ["emergency-fund-calculator", "Emergency fund calculator", "How much you need for a safety net."],
      ["savings-goal-calculator", "Savings goal calculator", "How much to save each month to reach a goal."],
      ["loan-calculator", "Loan calculator", "Monthly repayment and total interest, flat vs reducing balance."],
    ].map(([id, t, d]) => ({ t, u: `/tools/#${id}`, c: "Calculator", d, h: "calculator tool naira", b: d, k: "tool" })),
    ...getAllDocPages().map((p) => ({ t: p.title, u: `/${p.slug}/`, c: "Page", d: p.description, h: p.toc.map((t) => t.text).join(" "), b: p.intro, k: "page" })),
    { t: "Start here", u: "/start-here/", c: "Page", d: "A clear path through the basics.", h: "beginner new", b: "", k: "page" },
    { t: "Contact", u: "/contact/", c: "Page", d: "Corrections, questions and editorial enquiries.", h: "email", b: "", k: "page" },
  ];
  return Response.json(docs);
}
