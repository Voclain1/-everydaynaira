import { isoSvg, type IsoOptions } from "@/lib/iso";

export function IsoArt({ className = "", ...opts }: IsoOptions & { className?: string }) {
  return <div className={`art ${className}`} dangerouslySetInnerHTML={{ __html: isoSvg(opts) }} />;
}
