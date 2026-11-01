import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { SITE, type AuthorKey } from "./site";
import type { Motif } from "./topics";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content/posts");
const PAGES_DIR = path.join(ROOT, "content/pages");

export type TocItem = { id: string; text: string };
export type Source = { publisher: string; title: string; url?: string; date?: string };
export type Faq = { q: string; a: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  tagline: string;
  date: string;
  updated: string;
  /** Date the facts in this post were last checked against sources */
  reviewed?: string;
  category: Motif;
  tags: string[];
  author: AuthorKey;
  focusKeyword: string;
  keyTakeaways: string[];
  sources: Source[];
  calculator?: string;
  /** Optional photo override: path under /public, e.g. /images/posts/slug.webp */
  image?: string;
  imageAlt?: string;
  html: string;
  toc: TocItem[];
  faqs: Faq[];
  readingMinutes: number;
  plain: string;
};

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  updated: string;
  html: string;
  toc: TocItem[];
};

/** rehype plugin: open external links in a new tab, wrap tables for horizontal scroll */
function rehypeSiteTweaks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href) && !href.includes(new URL(SITE.url).host)) {
          node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" };
        }
      }
      if (node.tagName === "table" && parent && typeof index === "number") {
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        };
        (parent.children as Element[])[index] = wrapper;
        return "skip";
      }
    });
  };
}

function render(md: string) {
  const toc: TocItem[] = [];
  const collect = () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "h2") {
        const text = textOf(node);
        toc.push({ id: String(node.properties?.id ?? ""), text: text.replace(/^\d+\.\s+/, "") });
      }
    });
  };
  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeSiteTweaks)
      .use(collect)
      .use(rehypeStringify)
      .processSync(md),
  );
  return { html, toc };
}

function textOf(node: any): string {
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

const stripMd = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Pull Q&A pairs out of the FAQ section so we can emit FAQPage schema. */
function extractFaqs(md: string): Faq[] {
  const m = md.match(/\n## (?:FAQs?|Frequently Asked Questions?)[^\n]*\n([\s\S]*?)(?=\n## |\s*$)/i);
  if (!m) return [];
  const section = m[1];
  const faqs: Faq[] = [];
  if (/\n### /.test("\n" + section)) {
    const parts = ("\n" + section).split(/\n### /).slice(1);
    for (const p of parts) {
      const [q, ...rest] = p.split("\n");
      const a = stripMd(rest.join(" "));
      if (q && a) faqs.push({ q: stripMd(q), a });
    }
  } else {
    for (const para of section.split(/\n\s*\n/)) {
      const mm = para.trim().match(/^\*\*(.+?\?)\*\*\s*([\s\S]+)$/);
      if (mm) faqs.push({ q: stripMd(mm[1]), a: stripMd(mm[2]) });
    }
  }
  return faqs;
}

const SOURCES: Record<string, Source> = JSON.parse(fs.readFileSync(path.join(ROOT, "content/sources.json"), "utf8"));

/**
 * Sources in front matter are keys into content/sources.json, so each source is written once
 * and linked the same way everywhere. A post can also give an inline { publisher, title, url }.
 */
function resolveSources(list: unknown[], slug: string): Source[] {
  return list.map((item) => {
    if (typeof item === "string") {
      const hit = SOURCES[item];
      if (hit) return hit;
      console.warn(`[sources] "${slug}": unknown source key "${item}" (add it to content/sources.json)`);
      return { publisher: "", title: item };
    }
    return item as Source;
  });
}

let postCache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (postCache) return postCache;
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const { html, toc } = render(content);
    const plain = stripMd(content);
    const words = plain.split(" ").length;
    return {
      slug: data.slug ?? file.replace(/\.md$/, ""),
      title: data.title,
      description: data.description || data.tagline || "",
      tagline: data.tagline || "",
      date: data.date,
      updated: data.updated || data.date,
      reviewed: data.reviewed,
      category: data.category,
      tags: data.tags ?? [],
      author: (data.author ?? "benedict") as AuthorKey,
      focusKeyword: data.focusKeyword ?? "",
      keyTakeaways: data.keyTakeaways ?? [],
      sources: resolveSources(data.sources ?? [], data.slug ?? file),
      calculator: data.calculator,
      image: data.image,
      imageAlt: data.imageAlt,
      html,
      toc,
      faqs: extractFaqs("\n" + content),
      readingMinutes: Math.max(1, Math.round(words / 220)),
      plain,
    } satisfies Post;
  });
  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  postCache = posts;
  return posts;
}

export const getPost = (slug: string) => getAllPosts().find((p) => p.slug === slug);
export const postsInCategory = (cat: string) => getAllPosts().filter((p) => p.category === cat);

export function relatedPosts(post: Post, n = 3) {
  const same = getAllPosts().filter((p) => p.slug !== post.slug && p.category === post.category);
  const other = getAllPosts().filter((p) => p.slug !== post.slug && p.category !== post.category);
  return [...same, ...other].slice(0, n);
}

let pageCache: DocPage[] | null = null;
export function getAllDocPages(): DocPage[] {
  if (pageCache) return pageCache;
  pageCache = fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(PAGES_DIR, file), "utf8"));
      const { html, toc } = render(content);
      return {
        slug: data.slug ?? file.replace(/\.md$/, ""),
        title: data.title,
        description: data.description ?? "",
        intro: data.intro ?? "",
        updated: data.updated ?? "",
        html,
        toc,
      };
    });
  return pageCache;
}
export const getDocPage = (slug: string) => getAllDocPages().find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
