export function PrivacyPage() {
  return (
    <Policy
      title="Privacy Policy"
      sections={[
        "CrowdSpark stores account, campaign, contribution and payment metadata required to operate the platform.",
        "Authentication cookies are used to maintain secure sessions. Secrets and payment credentials remain on the server.",
        "Users can contact support to request account assistance or data clarification."
      ]}
    />
  );
}
export function TermsPage() {
  return (
    <Policy
      title="Terms & Conditions"
      sections={[
        "Campaigns must be accurate, lawful and supported by meaningful descriptions.",
        "Supporters are responsible for reviewing campaign information before contributing credits.",
        "Admins may moderate campaigns, suspend accounts, resolve reports and review withdrawals to protect the platform.",
        "Demo payments are for local testing only and do not transfer real money."
      ]}
    />
  );
}
function Policy({ title, sections }: { title: string; sections: string[] }) {
  return (
    <main className="container-app py-16">
      <article className="card mx-auto max-w-4xl p-8 sm:p-12">
        <p className="font-bold text-emerald-700">CROWDSPARK POLICY</p>
        <h1 className="mt-3 text-4xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: July 14, 2026</p>
        <div className="mt-8 space-y-6">
          {sections.map((text, i) => (
            <section key={text}>
              <h2 className="text-xl font-bold">
                {i + 1}.{" "}
                {[
                  "Platform information",
                  "Account and security",
                  "Moderation and rights",
                  "Demo environment"
                ][i] || "General terms"}
              </h2>
              <p className="mt-3 leading-8 text-slate-600">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
