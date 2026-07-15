import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="card max-w-lg p-10 text-center">
        <p className="text-6xl font-black text-emerald-600">404</p>
        <h1 className="mt-4 text-3xl font-black">Page not found</h1>
        <p className="mt-3 text-slate-600">The requested CrowdSpark page does not exist.</p>
        <Link to="/" className="btn-primary mt-7">
          Return home
        </Link>
      </section>
    </main>
  );
}
