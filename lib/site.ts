export const SITE = {
  name: "EverydayNaira",
  legalName: "EveryDay Naira",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://everydaynaira.com").replace(/\/$/, ""),
  tagline: "Practical money guidance for everyday Nigerians",
  description:
    "EverydayNaira helps Nigerians understand budgeting, saving, emergency funds, bank charges, debt, and everyday money decisions with clear, practical guidance.",
  email: "ben@everydaynaira.com",
  locale: "en_NG",
};

export const AUTHORS = {
  benedict: {
    slug: "benedict",
    name: "Benedict Arinze Belolisah",
    initials: "BA",
    role: "Founder and Lead Researcher, EverydayNaira",
    url: "/authors/",
    bio: "Benedict Arinze Belolisah is the founder and lead researcher of EverydayNaira, an independent personal finance publication focused on helping Nigerians understand money in simple, practical terms.",
  },
} as const;

export type AuthorKey = keyof typeof AUTHORS;

export const absUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Open Graph + Twitter image fields for a page, pointing at /og/<key>/ */
export const ogFor = (key: string, alt: string) => {
  const images = [{ url: `/og/${key}/`, width: 1200, height: 630, alt }];
  return { openGraph: { images }, twitter: { card: "summary_large_image" as const, images: images.map((i) => i.url) } };
};
