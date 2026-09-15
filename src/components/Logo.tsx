import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.02em] ${
        light ? "text-white" : "text-[#242424] dark:text-[#f5f5f5]"
      }`}
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-brand-600 text-white shadow-sm dark:bg-brand-500">
        <Sparkles className="size-[18px]" strokeWidth={2} />
      </span>
      CrowdSpark
    </Link>
  );
}
