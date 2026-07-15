import { useState } from "react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { useAuth } from "../lib/AuthContext";

export default function ProfilePage() {
  const { current, refresh } = useAuth();
  const profile = current!.profile!;
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image || "");
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      setImage((await api.post<{ data: { url: string } }>("/uploads/images", fd)).data.data.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await authClient.updateUser({ name, image: image || undefined });
    if (result.error) {
      toast.error(result.error.message || "Update failed");
      return;
    }
    await refresh();
    toast.success("Profile updated");
  };
  return (
    <main className="space-y-6">
      <header>
        <p className="font-bold text-emerald-700">ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-black">Profile settings</h1>
      </header>
      <form onSubmit={save} className="card max-w-3xl space-y-6 p-7">
        <div className="flex items-center gap-5">
          <img
            src={
              image || "https://api.dicebear.com/9.x/initials/svg?seed=" + encodeURIComponent(name)
            }
            alt=""
            className="size-24 rounded-2xl object-cover"
          />
          <label className="btn-secondary">
            {uploading ? "Uploading..." : "Upload photo"}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
          </label>
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="field bg-slate-100" value={profile.email} readOnly />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="field bg-slate-100 capitalize" value={profile.role} readOnly />
        </div>
        <button className="btn-primary">Save profile</button>
      </form>
    </main>
  );
}
