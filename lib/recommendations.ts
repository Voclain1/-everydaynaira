import { TOPICS } from "./topics";

export type RecommendablePost = { slug: string; category: string; updated: string };

/**
 * Picks up to `limit` guides a signed-in reader has not read yet, from
 * their chosen interests and from the topics of their recent reading
 * history. A guide in a chosen interest scores 2, one in a recently read
 * topic scores 1; ties break by most recently updated. Guides with no
 * score are never picked, so recommendations stay personal, not generic.
 */
export function pickRecommendations(
  posts: RecommendablePost[],
  opts: {
    interests: string[];
    historyCategories: string[];
    excludeSlugs: string[];
    limit?: number;
  },
): RecommendablePost[] {
  const { interests, historyCategories, excludeSlugs, limit = 6 } = opts;
  const excluded = new Set(excludeSlugs);
  const interestSet = new Set(interests);
  const historySet = new Set(historyCategories);
  const scored = posts
    .filter((p) => !excluded.has(p.slug))
    .map((p) => ({
      post: p,
      score: (interestSet.has(p.category) ? 2 : 0) + (historySet.has(p.category) ? 1 : 0),
    }))
    .filter((x) => x.score > 0);
  scored.sort(
    (a, b) => b.score - a.score || +new Date(b.post.updated) - +new Date(a.post.updated),
  );
  return scored.slice(0, limit).map((x) => x.post);
}

/**
 * One line explaining why these guides were picked, or null when there is
 * no basis yet (no interests chosen and nothing read).
 */
export function describeRecommendationBasis(
  interests: string[],
  historyCategories: string[],
): string | null {
  const names = TOPICS.filter((t) => interests.includes(t.category)).map((t) => t.name);
  const hasHistory = historyCategories.length > 0;
  if (names.length > 0 && hasHistory)
    return `Based on your interest in ${joinNames(names)}, and the guides you have read recently.`;
  if (names.length > 0) return `Based on your interest in ${joinNames(names)}.`;
  if (hasHistory) return "Based on the guides you have read recently.";
  return null;
}

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
