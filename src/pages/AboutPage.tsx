import { BadgeCheck, Eye, HeartHandshake, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="container-app py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-bold text-emerald-700">ABOUT CROWDSPARK</p>
        <h1 className="mt-3 text-5xl font-black">Crowdfunding built around clarity</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          CrowdSpark connects Supporters with Creators through moderated campaigns, platform
          credits, progress updates and traceable financial records.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {[
          [
            Eye,
            "Transparent by design",
            "Campaign goals, progress, updates and status changes remain visible."
          ],
          [
            ShieldCheck,
            "Role-based protection",
            "Supporter, Creator and Admin workflows are enforced on the server."
          ],
          [
            HeartHandshake,
            "Community centered",
            "Campaign tools help creators communicate clearly with supporters."
          ],
          [
            BadgeCheck,
            "Moderated trust",
            "Admins review campaigns, withdrawals, users and reports."
          ]
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof Eye;
          return (
            <article key={String(title)} className="card p-7">
              <I className="size-9 text-emerald-600" />
              <h2 className="mt-5 text-xl font-bold">{String(title)}</h2>
              <p className="mt-3 leading-7 text-slate-600">{String(text)}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
