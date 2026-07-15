import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 text-xl font-black ${light ? "text-white" : "text-slate-950"}`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
        <Sparkles className="size-5" />
      </span>
      CrowdSpark
    </Link>
  );
}
