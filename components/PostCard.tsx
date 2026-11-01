import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/content";
import { topicByCategory } from "@/lib/topics";
import { IsoArt } from "./IsoArt";

export function PostCover({ post, className = "", priority = false, aspect = 1.6 }: { post: Post; className?: string; priority?: boolean; aspect?: number }) {
  if (post.image)
    return (
      <div className={`relative overflow-hidden bg-paper-2 ${className}`}>
        <Image src={post.image} alt={post.imageAlt ?? ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority={priority} />
      </div>
    );
  return <IsoArt motif={post.category} seed={post.slug} aspect={aspect} className={className} />;
}

export function PostCard({ post, variant = "default" }: { post: Post; variant?: "default" | "row" }) {
  const topic = topicByCategory(post.category);
  if (variant === "row")
    return (
      <Link href={`/${post.slug}/`} className="group grid grid-cols-[6.5rem_1fr] gap-4 border-t border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
        <PostCover post={post} className="aspect-[16/10] border border-line" />
        <div>
          <p className="text-sm text-ink-2">{topic.name} <span className="text-ink-3">/</span> {post.readingMinutes} min read</p>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em] group-hover:underline decoration-lime-deep decoration-2 underline-offset-4">{post.title}</h3>
        </div>
      </Link>
    );
  return (
    <Link href={`/${post.slug}/`} className="group flex h-full flex-col border border-line bg-card transition-colors hover:border-ink">
      <PostCover post={post} className="aspect-[16/10] border-b border-line" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm text-ink-2">{topic.name}</p>
        <h3 className="mt-2 text-xl font-semibold leading-[1.2] tracking-[-0.025em]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-2">{post.tagline || post.description}</p>
        <p className="mt-auto pt-5 text-sm text-ink-3">{post.readingMinutes} min read</p>
      </div>
    </Link>
  );
}
