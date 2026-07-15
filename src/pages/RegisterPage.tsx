import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "../components/Logo";
import { api, apiErrorMessage } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { refreshAccessToken } from "../lib/access-token";
import { dashboardPath, useAuth } from "../lib/AuthContext";
import type { Profile, Role } from "../types";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const schema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters").max(120),
    email: z.string().email("Enter a valid email address"),
    role: z.enum(["supporter", "creator"]),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
    accepted: z.literal(true, { message: "Accept the Terms and Privacy Policy" })
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match"
  });

type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const defaultRole = params.get("role") === "creator" ? "creator" : "supporter";
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [googlePending, setGooglePending] = useState(false);
  const previewUrl = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : null),
    [profileFile]
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: defaultRole,
      password: "",
      confirm: "",
      accepted: false as true
    }
  });

  const chooseProfileImage = (file?: File) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Only JPEG, PNG and WebP profile images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Profile image cannot exceed 3 MB");
      return;
    }
    setProfileFile(file);
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileFile) return null;
    const formData = new FormData();
    formData.append("image", profileFile);
    const response = await api.post<{ data: { url: string } }>("/uploads/images", formData, {
      onUploadProgress: (event) => {
        setUploadProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0);
      }
    });
    return response.data.data.url;
  };

  const submit = async (values: Values) => {
    const result = await authClient.signUp.email({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password
    });
    if (result.error) {
      toast.error(result.error.message || "Registration failed");
      return;
    }

    const profile = (await api.post<{ data: Profile }>("/users/onboarding", { role: values.role }))
      .data.data;
    await refreshAccessToken();

    if (profileFile) {
      try {
        const imageUrl = await uploadProfileImage();
        if (imageUrl) {
          const updateResult = await authClient.updateUser({ image: imageUrl });
          if (updateResult.error)
            throw new Error(updateResult.error.message || "Profile image could not be saved");
        }
      } catch (error) {
        toast.error(apiErrorMessage(error, "Account created, but the profile image upload failed"));
      } finally {
        setUploadProgress(0);
      }
    }

    await refreshAccessToken();
    await refresh();
    toast.success(`${values.role === "supporter" ? 50 : 20} registration credits added`);
    navigate(dashboardPath(profile.role), { replace: true });
  };

  const google = async () => {
    if (!getValues("accepted")) {
      toast.error("Accept the Terms and Privacy Policy before continuing");
      return;
    }
    const role = getValues("role") as Role;
    sessionStorage.setItem("crowdspark.pendingRole", role || defaultRole);
    setGooglePending(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${location.origin}/onboarding`
      });
    } catch (error) {
      setGooglePending(false);
      toast.error(apiErrorMessage(error, "Google registration is not configured"));
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col">
        <Logo light />
        <div className="my-auto max-w-xl">
          <p className="font-bold text-emerald-300">JOIN THE COMMUNITY</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">
            Choose how you want to create impact.
          </h1>
          <p className="mt-6 text-lg leading-8 text-emerald-100/70">
            Supporters receive 50 starting credits. Creators receive 20 credits and campaign tools.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-5 py-12">
        <div className="w-full max-w-xl">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-3xl font-black">Create your CrowdSpark account</h1>
          <form onSubmit={handleSubmit(submit)} className="card mt-7 space-y-5 p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="rounded-xl border border-slate-300 p-4">
                <input type="radio" value="supporter" {...register("role")} />
                <span className="ml-2 font-bold">Supporter</span>
                <p className="mt-2 text-sm text-slate-500">Discover and fund campaigns.</p>
              </label>
              <label className="rounded-xl border border-slate-300 p-4">
                <input type="radio" value="creator" {...register("role")} />
                <span className="ml-2 font-bold">Creator</span>
                <p className="mt-2 text-sm text-slate-500">Launch and manage campaigns.</p>
              </label>
            </div>

            <div>
              <label className="label">Full name</label>
              <input className="field" autoComplete="name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="field" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <section className="rounded-2xl border border-slate-200 p-4">
              <p className="label mb-1">Profile image (optional)</p>
              <p className="text-xs text-slate-500">JPEG, PNG or WebP. Maximum 3 MB.</p>
              {previewUrl ? (
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="size-24 rounded-2xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    className="btn-secondary text-red-600"
                    onClick={() => setProfileFile(null)}
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              ) : (
                <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-600">
                  <ImagePlus className="mb-2 size-7 text-emerald-600" />
                  Choose profile image
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => chooseProfileImage(event.target.files?.[0])}
                  />
                </label>
              )}
              {uploadProgress > 0 ? (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Uploading {uploadProgress}%
                  </p>
                </div>
              ) : null}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <input
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirm")}
                />
                {errors.confirm && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>
                )}
              </div>
            </div>

            <label className="flex gap-3 text-sm text-slate-600">
              <input type="checkbox" {...register("accepted")} />I accept the{" "}
              <Link className="font-bold text-emerald-700" to="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="font-bold text-emerald-700" to="/privacy">
                Privacy Policy
              </Link>
              .
            </label>
            {errors.accepted && <p className="text-xs text-red-600">{errors.accepted.message}</p>}

            <button className="btn-primary w-full" disabled={isSubmitting || googlePending}>
              {isSubmitting ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <UserPlus className="size-5" />
              )}
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              className="btn-secondary w-full"
              disabled={isSubmitting || googlePending}
              onClick={() => void google()}
            >
              {googlePending ? <LoaderCircle className="size-5 animate-spin" /> : null}
              {googlePending ? "Opening Google..." : "Continue with Google"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            Already registered?{" "}
            <Link className="font-bold text-emerald-700" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
