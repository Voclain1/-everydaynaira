import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { isoDataUri } from "./iso";
import type { Motif } from "./topics";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (f: string) => fs.readFileSync(path.join(process.cwd(), "assets/fonts", f));

/** Social share image: title on the left, the topic's isometric art on the right. */
export function ogImage({ title, kicker, motif, seed }: { title: string; kicker: string; motif: Motif | "hero"; seed: string }) {
  const art = isoDataUri({ motif, seed, aspect: 1, background: null, grid: false, padding: 0.06 });
  const size = title.length > 70 ? 54 : title.length > 45 ? 62 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F3F2ED",
          backgroundImage: "linear-gradient(to right, rgba(26,35,41,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,35,41,0.05) 1px, transparent 1px)",
          backgroundSize: "63px 63px",
          fontFamily: "Geist",
          color: "#1A2329",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 700, padding: "64px 0 60px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 500 }}>
            <div style={{ width: 20, height: 20, background: "#D4EE4A", border: "3px solid #1A2329" }} />
            {kicker}
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: size, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.045em" }}>{title}</div>
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em" }}>
            <div style={{ width: 34, height: 8, background: "#D4EE4A", border: "2px solid #1A2329" }} />
            EverydayNaira
          </div>
        </div>
        <div style={{ display: "flex", width: 500, height: 630, alignItems: "center", justifyContent: "center", paddingRight: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} width={460} height={460} alt="" />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: font("Geist-Bold.ttf"), weight: 700, style: "normal" },
        { name: "Geist", data: font("Geist-Medium.ttf"), weight: 500, style: "normal" },
      ],
    },
  );
}
