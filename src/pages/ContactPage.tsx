import { useState } from "react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [pending, setPending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await api.post("/contact", form);
      toast.success("Message received");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };
  return (
    <main className="container-app py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="font-bold text-emerald-700">CONTACT & SUPPORT</p>
          <h1 className="mt-3 text-5xl font-black">Tell us how we can help</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Use this form for platform support, campaign questions or responsible disclosure.
            Messages are stored securely for Admin review.
          </p>
          <div className="card mt-8 p-6">
            <p className="font-bold">Demo support</p>
            <p className="mt-2 text-sm text-slate-600">support@crowdspark.demo</p>
          </div>
        </div>
        <form onSubmit={submit} className="card space-y-5 p-7">
          <div>
            <label className="label">Name</label>
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              className="field"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="field"
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              minLength={10}
            />
          </div>
          <button className="btn-primary w-full" disabled={pending}>
            {pending ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </main>
  );
}
