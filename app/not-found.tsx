import Link from "next/link";
import { IsoArt } from "@/components/IsoArt";
import { Arrow } from "@/components/Arrow";

export default function NotFound() {
  return (
    <section className="gridlines">
      <div className="wrap grid gap-10 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-mono text-ink-3">404</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.4rem)]">This page has moved or never existed.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">Search for the guide you need, or start from one of the topics below.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">Go to the home page <Arrow /></Link>
            <Link href="/start-here/" className="btn btn-ghost">Start here</Link>
          </div>
        </div>
        <IsoArt motif="debt" seed="404" background={null} grid={false} aspect={1.3} className="aspect-[1.3] w-full" />
      </div>
    </section>
  );
}
