export type Motif = "budgeting" | "savings" | "banking" | "debt" | "income" | "money-safety";

export type Topic = {
  /** URL of the hub page, e.g. /saving/ */
  hub: string;
  /** WordPress category slug the posts are filed under */
  category: Motif;
  name: string;
  short: string;
  /** One-line summary used on cards */
  summary: string;
  /** Hub page intro (from the original hub page) */
  intro: string;
  /** Longer description (from the original WP category description) */
  description: string;
  metaDescription: string;
  note?: { title: string; body: string; tone: "info" | "warn" };
  tool?: { id: string; title: string; body: string; cta: string };
  /** Shortcut links shown on the home page topic index */
  starters: { label: string; href: string }[];
};

export const TOPICS: Topic[] = [
  {
    hub: "/budgeting/",
    category: "budgeting",
    name: "Budgeting",
    short: "Budgeting",
    summary: "Plan your income, control your spending, and stop wondering where your money went.",
    intro:
      "Most budgets fail not because people lack discipline, but because the budget doesn't reflect how money actually works in real Nigerian life. These guides do.",
    description:
      "A budget only works if it matches how money actually moves in your life — not a template built for a salary that arrives the same amount, same day, every month. These guides walk through practical budgeting methods, including approaches built specifically for irregular income, so you can plan with real numbers instead of guesswork.",
    metaDescription:
      "Practical budgeting guides for Nigerians: monthly budgets, the 50/30/20 rule adapted to Nigerian costs, and budgeting on irregular income.",
    tool: {
      id: "budget-calculator",
      title: "Use the budget calculator alongside these guides",
      body: "Enter your monthly income and see a suggested budget breakdown based on your actual categories and priorities.",
      cta: "Open the budget calculator",
    },
    starters: [
      { label: "Monthly budget guide", href: "/how-to-create-a-monthly-budget-in-nigeria/" },
      { label: "50/30/20 budget for Nigerians", href: "/5030-20-budget-rule-for-nigerians/" },
      { label: "Budget on irregular income", href: "/how-to-manage-irregular-income-in-nigeria/" },
    ],
  },
  {
    hub: "/saving/",
    category: "savings",
    name: "Saving",
    short: "Saving",
    summary: "Build an emergency fund, set savings goals, and save consistently even on a tight income.",
    intro:
      "Building savings is hard when life is expensive. These guides focus on realistic strategies for people who don't have a lot left over at the end of the month.",
    description:
      "Saving consistently is harder when inflation quietly erodes value and “small” emergencies keep interrupting the plan. This section covers building an emergency fund from zero, where to actually keep savings in Nigeria, and how to save on a low or irregular income without it feeling impossible.",
    metaDescription:
      "Saving guides for Nigerians: emergency funds, sinking funds, where to keep your savings, and how to save on a salary.",
    tool: {
      id: "emergency-fund-calculator",
      title: "Calculate your emergency fund target",
      body: "Find out how much you need based on your monthly expenses and household situation.",
      cta: "Open the emergency fund calculator",
    },
    starters: [
      { label: "Emergency fund explained", href: "/emergency-fund-nigeria/" },
      { label: "Saving on a salary", href: "/how-to-save-money-in-nigeria-as-a-salary-earner-practical-guide/" },
      { label: "Sinking funds guide", href: "/what-are-sinking-funds-and-how-do-you-use-them-in-nigeria/" },
    ],
  },
  {
    hub: "/banking/",
    category: "banking",
    name: "Banking",
    short: "Banking",
    summary: "Understand charges, account types, transfer fees, and how everyday Nigerian banking works.",
    intro:
      "Understanding how Nigerian banking works — from account types and charges to transfers and digital fees — helps you keep more of your money where it belongs.",
    description:
      "Nigerian banks don't always make their charges obvious until they've already hit your balance. This section breaks down transfer fees, maintenance charges, and account types across major banks, plus how to tell when a “free” account isn't really free — so you can choose banking products that work for you instead of quietly costing you money.",
    metaDescription:
      "Nigerian banking explained: bank charges, transfer fees, stamp duty, and how to keep more of your money.",
    note: {
      title: "Fees change",
      body: "Banking fees in Nigeria can change. Always confirm current charges on your bank's official website or by contacting your branch directly. The guides on this site are educational and updated based on available official documentation.",
      tone: "info",
    },
    starters: [
      { label: "Bank charges explained", href: "/bank-charges-in-nigeria-explained/" },
      { label: "Transfer fees and ATM costs", href: "/bank-charges-nigeria/" },
      { label: "Stamp duty on transfers", href: "/stamp-duty-on-bank-transfer-in-nigeria-explained/" },
    ],
  },
  {
    hub: "/debt/",
    category: "debt",
    name: "Debt & Loans",
    short: "Debt",
    summary: "Understand how loan interest really works and avoid costly borrowing mistakes before they happen.",
    intro:
      "Before you borrow anything, it helps to understand exactly how you'll pay it back — and what it will actually cost you in total. These guides give you that clarity.",
    description:
      "Loan interest in Nigeria — especially from digital lending apps — is often more expensive than it looks at first glance. This section explains how interest actually compounds, the warning signs of predatory lending terms, and repayment strategies that get you out of debt faster instead of just managing the monthly pressure.",
    metaDescription:
      "Debt and loan guides for Nigerians: how loan interest works, what APR means, salary advances, and warning signs of dangerous loan offers.",
    note: {
      title: "About loan information",
      body: "Loan terms, fees, and interest rates vary by lender and can change. Always verify current terms directly with the provider. The content here is educational and does not constitute a loan recommendation or comparison ranking.",
      tone: "info",
    },
    tool: {
      id: "loan-calculator",
      title: "See the full cost before you borrow",
      body: "Compare flat-rate and reducing-balance repayments, and see total interest in naira.",
      cta: "Open the loan calculator",
    },
    starters: [
      { label: "How loan interest works", href: "/how-loan-interest-works-in-nigeria/" },
      { label: "Dangerous loan warning signs", href: "/signs-of-dangerous-loan-offers-every-nigerian-should-know/" },
      { label: "What APR means", href: "/what-apr-means-in-nigeria-loans/" },
    ],
  },
  {
    hub: "/income/",
    category: "income",
    name: "Income",
    short: "Income",
    summary: "Manage salary, freelance cash flow, and side-hustle income with clearer, more practical systems.",
    intro:
      "Whether you earn a salary, freelance, or run a side hustle — or all three — managing your income well is about creating systems that work even on difficult months.",
    description:
      "Managing income well is a different skill from earning it — especially with salary, freelance payments, and side-hustle cash flow that don't behave the same way. This section covers salary management, separating personal from business money, and building systems for income that arrives unpredictably.",
    metaDescription:
      "Income guides for Nigerians: irregular income, paying yourself from a side hustle, and separating personal and business money.",
    note: {
      title: "Every income pattern is different",
      body: "The systems in these guides are starting points. Adjust the percentages and timing to how your money actually arrives, and confirm any tax obligations for your business with official sources.",
      tone: "info",
    },
    starters: [
      { label: "Managing irregular income", href: "/how-to-manage-irregular-income-in-nigeria/" },
      { label: "Paying yourself from a side hustle", href: "/how-to-pay-yourself-from-a-side-hustle/" },
      { label: "Separating business money", href: "/how-to-separate-personal-and-business-money-in-nigeria/" },
    ],
  },
  {
    hub: "/money-safety/",
    category: "money-safety",
    name: "Money Safety",
    short: "Safety",
    summary: "Spot scams, protect your accounts, and know exactly what to do when something goes wrong.",
    intro:
      "Scams, fraud, and risky financial offers are common. The best protection is knowing what they look like before you encounter them.",
    description:
      "Scams targeting Nigerian bank and fintech users keep evolving — fake investment platforms, phishing links, cloned apps. This section covers how to recognize common scam patterns, verify whether a finance app is actually legitimate before trusting it, and exactly what to do if you spot unauthorized activity on your account.",
    metaDescription:
      "Money safety for Nigerians: common online scams, how to spot them, and what to do after an unauthorized debit.",
    note: {
      title: "If money has already left your account",
      body: "Contact your bank's official helpline immediately. You can also report to the CBN Consumer Protection Department or the EFCC. Do not delay.",
      tone: "warn",
    },
    starters: [
      { label: "Common scams in Nigeria", href: "/online-scams-in-nigeria/" },
      { label: "Unauthorized debit guide", href: "/what-to-do-after-an-unauthorized-debit-in-nigeria/" },
      { label: "Dangerous loan offers", href: "/signs-of-dangerous-loan-offers-every-nigerian-should-know/" },
    ],
  },
];

export const topicByCategory = (cat: string) => TOPICS.find((t) => t.category === cat) ?? TOPICS[0];
export const topicByHub = (slug: string) => TOPICS.find((t) => t.hub === `/${slug}/`);
