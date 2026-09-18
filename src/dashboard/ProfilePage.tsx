import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

import { authClient } from "../lib/auth-client";
import { useAuth } from "../lib/AuthContext";

const fieldClass = `
  w-full
  rounded-xl

  border
  border-[var(--editorial-border)]

  bg-white/35

  px-4
  py-2.5

  text-sm
  text-[var(--editorial-text)]

  outline-none

  transition-all
  duration-200

  placeholder:text-[var(--editorial-muted)]

  hover:border-[#7b9187]

  focus:border-[#527064]
  focus:bg-white/55
  focus:ring-4
  focus:ring-[#527064]/10

  dark:bg-white/[0.03]
  dark:hover:border-[#5d7469]
  dark:focus:border-[#78988a]
  dark:focus:bg-white/[0.05]
`;

const readonlyFieldClass = `
  w-full
  cursor-not-allowed

  rounded-xl

  border
  border-[var(--editorial-border)]

  bg-black/[0.025]

  px-4
  py-2.5

  text-sm
  text-[var(--editorial-text-soft)]

  outline-none

  dark:bg-white/[0.025]
`;

const labelClass = `
  mb-2
  block

  text-[10px]
  font-bold
  uppercase
  tracking-[0.19em]

  text-[var(--editorial-muted)]
`;

export default function ProfilePage() {
  const { current, refresh } = useAuth();

  const profile = current!.profile!;

  const [name, setName] = useState(profile.name);

  const [image, setImage] = useState(profile.image || "");

  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setImage(profile.image || "");
  }, [profile.name, profile.image]);

  const upload = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload a JPEG, PNG or WebP image");

      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be smaller than 3 MB");

      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await api.post<{
        data: {
          url: string;
        };
      }>("/uploads/images", formData);

      setImage(response.data.data.url);

      toast.success("Image uploaded");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      toast.error("Name must contain at least 2 characters");

      return;
    }

    setSaving(true);

    try {
      const result = await authClient.updateUser({
        name: trimmedName,
        image: image || undefined
      });

      if (result.error) {
        toast.error(result.error.message || "Update failed");

        return;
      }

      await refresh();

      toast.success("Profile updated");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CS";

  const hasChanges = name.trim() !== profile.name.trim() || image !== (profile.image || "");

  return (
    <motion.main
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 0.3
      }}
      className="space-y-6"
    >
      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden

          rounded-[28px]

          border
          border-white/10

          bg-[#123127]

          px-6
          py-7

          text-white

          shadow-[0_26px_70px_rgba(18,49,39,0.16)]

          sm:px-8

          dark:bg-[#091812]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-28

            size-80

            rounded-full

            bg-[#91aa9d]/15

            blur-[90px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-32
            left-[30%]

            size-72

            rounded-full

            bg-[#527064]/10

            blur-[90px]
          "
        />

        <div
          className="
            relative

            flex
            flex-col
            gap-6

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  flex
                  size-7
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.06]
                "
              >
                <UserRound className="size-3.5 text-[#a9c1b5]" />
              </span>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]

                  text-[#9fb6ab]
                "
              >
                Account workspace
              </p>
            </div>

            <h1
              className="
                display-heading

                mt-4

                text-[clamp(3rem,5vw,5rem)]
                leading-[0.88]

                text-white
              "
            >
              Profile settings.
            </h1>

            <p
              className="
                mt-4
                max-w-2xl

                text-sm
                leading-6

                text-[#b9ccc3]
              "
            >
              Manage your public identity and keep your CrowdSpark account information current.
            </p>
          </div>

          <div
            className="
              rounded-2xl

              border
              border-white/10

              bg-white/[0.06]

              px-5
              py-3.5

              backdrop-blur-xl
            "
          >
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]

                text-[#91aa9d]
              "
            >
              Account role
            </p>

            <p
              className="
                mt-1

                text-xl
                font-semibold
                capitalize

                tracking-[-0.03em]

                text-white
              "
            >
              {profile.role}
            </p>
          </div>
        </div>
      </section>

      {/* PROFILE CONTENT */}
      <div
        className="
          grid
          gap-5

          xl:grid-cols-[320px_1fr]
        "
      >
        {/* IDENTITY CARD */}
        <motion.aside
          initial={{
            opacity: 0,
            y: 16
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.4
          }}
          className="
            campaign-surface

            self-start

            overflow-hidden
          "
        >
          <div
            className="
              relative

              border-b
              border-[var(--editorial-border)]

              p-6
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-16
                -top-16

                size-44

                rounded-full

                bg-[#78988a]/10

                blur-3xl
              "
            />

            <div className="relative">
              <div
                className="
                  relative
                  mx-auto

                  size-28
                "
              >
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="
                      size-full

                      rounded-[28px]

                      border
                      border-[var(--editorial-border)]

                      object-cover

                      shadow-[0_18px_45px_rgba(20,45,36,0.12)]
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      size-full
                      items-center
                      justify-center

                      rounded-[28px]

                      bg-[#d6e3dd]

                      text-3xl
                      font-semibold

                      tracking-[-0.05em]

                      text-[#10261f]

                      shadow-[0_18px_45px_rgba(20,45,36,0.12)]
                    "
                  >
                    {initials}
                  </div>
                )}

                <label
                  className="
                    absolute
                    -bottom-2
                    -right-2

                    flex
                    size-10
                    cursor-pointer
                    items-center
                    justify-center

                    rounded-full

                    border-4
                    border-[var(--editorial-card)]

                    bg-[#20352d]

                    text-white

                    shadow-lg

                    transition-all

                    hover:scale-105
                    hover:bg-[#2f4b40]

                    dark:bg-[#d6e3dd]
                    dark:text-[#10261f]
                  "
                  aria-label="Upload profile photo"
                >
                  {uploading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Camera className="size-4" />
                  )}

                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={(event) => void upload(event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="mt-6 text-center">
                <h2
                  className="
                    display-heading

                    text-3xl
                    leading-none

                    text-[var(--editorial-text)]
                  "
                >
                  {profile.name}
                </h2>

                <p
                  className="
                    mt-2

                    text-xs

                    text-[var(--editorial-muted)]
                  "
                >
                  {profile.email}
                </p>

                <span
                  className="
                    mt-4

                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-[var(--editorial-border)]

                    bg-white/25

                    px-3
                    py-1.5

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.13em]

                    text-[var(--editorial-text-soft)]

                    dark:bg-white/[0.03]
                  "
                >
                  <ShieldCheck className="size-3.5" />

                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="editorial-label">Profile image</p>

            <p
              className="
                mt-2

                text-xs
                leading-5

                text-[var(--editorial-muted)]
              "
            >
              JPEG, PNG or WebP. Maximum file size is 3 MB.
            </p>

            <label
              className="
                mt-4

                inline-flex
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2

                rounded-full

                border
                border-[var(--editorial-border)]

                px-4
                py-2.5

                text-sm
                font-semibold

                text-[var(--editorial-text-soft)]

                transition-all

                hover:bg-white/40
                hover:text-[var(--editorial-text)]

                dark:hover:bg-white/[0.05]
              "
            >
              {uploading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="size-4" />
                  Change photo
                </>
              )}

              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </label>
          </div>
        </motion.aside>

        {/* SETTINGS FORM */}
        <motion.form
          initial={{
            opacity: 0,
            y: 16
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.4,
            delay: 0.05
          }}
          onSubmit={save}
          className="
            campaign-surface

            overflow-hidden
          "
        >
          {/* FORM HEADER */}
          <div
            className="
              flex
              items-start
              justify-between
              gap-4

              border-b
              border-[var(--editorial-border)]

              p-5
              sm:p-6
            "
          >
            <div>
              <p className="editorial-label">Personal information</p>

              <h2
                className="
                  display-heading

                  mt-1.5

                  text-3xl
                  leading-none

                  sm:text-4xl
                "
              >
                Account identity
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl

                  text-xs
                  leading-5

                  text-[var(--editorial-muted)]
                "
              >
                Your name and profile image can be updated here. Email and role are controlled by
                your account configuration.
              </p>
            </div>

            <div
              className="
                flex
                size-10
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-[#d6e3dd]

                text-[#10261f]
              "
            >
              <UserRound className="size-[17px]" />
            </div>
          </div>

          {/* FORM BODY */}
          <div className="p-5 sm:p-6">
            <div
              className="
                grid
                max-w-[920px]
                gap-5

                lg:grid-cols-2
              "
            >
              {/* NAME */}
              <div
                className="
                  max-w-2xl

                  lg:col-span-2
                "
              >
                <label className={labelClass} htmlFor="profile-name">
                  Full name
                </label>

                <input
                  id="profile-name"
                  className={fieldClass}
                  value={name}
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Your full name"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              {/* EMAIL */}
              <div className="max-w-md">
                <label className={labelClass} htmlFor="profile-email">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    className="
                      pointer-events-none

                      absolute
                      left-4
                      top-1/2

                      size-4
                      -translate-y-1/2

                      text-[var(--editorial-muted)]
                    "
                  />

                  <input
                    id="profile-email"
                    className={`
                      ${readonlyFieldClass}
                      pl-11
                    `}
                    value={profile.email}
                    readOnly
                  />
                </div>
              </div>

              {/* ROLE */}
              <div className="max-w-sm">
                <label className={labelClass} htmlFor="profile-role">
                  Role
                </label>

                <div className="relative">
                  <ShieldCheck
                    className="
                      pointer-events-none

                      absolute
                      left-4
                      top-1/2

                      size-4
                      -translate-y-1/2

                      text-[var(--editorial-muted)]
                    "
                  />

                  <input
                    id="profile-role"
                    className={`
                      ${readonlyFieldClass}
                      pl-11
                      capitalize
                    `}
                    value={profile.role}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* SECURITY NOTE */}
            <div
              className="
                mt-6
                max-w-[920px]

                flex
                items-start
                gap-3

                rounded-2xl

                border
                border-[var(--editorial-border)]

                bg-white/20

                p-4

                dark:bg-white/[0.02]
              "
            >
              <div
                className="
                  flex
                  size-9
                  shrink-0
                  items-center
                  justify-center

                  rounded-full

                  bg-[#d6e3dd]

                  text-[#10261f]
                "
              >
                <LockKeyhole className="size-4" />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-semibold

                    text-[var(--editorial-text)]
                  "
                >
                  Protected account fields
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    leading-5

                    text-[var(--editorial-muted)]
                  "
                >
                  Email address and account role cannot be changed from this profile form.
                </p>
              </div>
            </div>

            {/* ACTION */}
            <div
              className="
                mt-6
                max-w-[920px]

                flex
                flex-col
                gap-3

                border-t
                border-[var(--editorial-border)]

                pt-5

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-xs

                  text-[var(--editorial-muted)]
                "
              >
                {hasChanges ? (
                  <>
                    <span
                      className="
                        size-2
                        rounded-full

                        bg-amber-500
                      "
                    />
                    Unsaved changes
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Profile is up to date
                  </>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={saving || uploading || !hasChanges}
                whileHover={
                  saving
                    ? undefined
                    : {
                        y: -1
                      }
                }
                whileTap={
                  saving
                    ? undefined
                    : {
                        scale: 0.985
                      }
                }
                className="
                  editorial-button

                  min-w-[150px]

                  disabled:cursor-not-allowed
                  disabled:opacity-45
                "
              >
                {saving ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save profile
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.main>
  );
}
