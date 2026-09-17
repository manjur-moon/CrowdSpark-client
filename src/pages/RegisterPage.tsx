import { zodResolver } from "@hookform/resolvers/zod";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Rocket,
  Sparkles,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "../components/Logo";

import { refreshAccessToken } from "../lib/access-token";
import { api, apiErrorMessage } from "../lib/api";
import { authClient } from "../lib/auth-client";
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

    accepted: z.literal(true, {
      message: "Accept the Terms and Privacy Policy"
    })
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match"
  });

type Values = z.infer<typeof schema>;

const fieldClass = `
  w-full
  rounded-xl

  border
  border-[#bdc9c5]

  bg-white/55

  px-4
  py-3

  text-sm
  text-[#17211d]

  outline-none

  backdrop-blur-md

  transition-all
  duration-200

  placeholder:text-[#74817b]

  hover:border-[#8ca096]

  focus:border-[#527064]
  focus:bg-white/75
  focus:ring-4
  focus:ring-[#527064]/10

  dark:border-[#33483f]
  dark:bg-white/[0.045]
  dark:text-[#edf4f0]
  dark:placeholder:text-[#83968d]

  dark:hover:border-[#557267]

  dark:focus:border-[#7f9f90]
  dark:focus:bg-white/[0.065]
`;

const labelClass = `
  mb-2
  block

  text-[10px]
  font-bold
  uppercase
  tracking-[0.2em]

  text-[#66766f]

  dark:text-[#96aaa1]
`;

export default function RegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { refresh } = useAuth();

  const defaultRole = params.get("role") === "creator" ? "creator" : "supporter";

  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [googlePending, setGooglePending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const previewUrl = useMemo(
    () => (profileFile ? URL.createObjectURL(profileFile) : null),
    [profileFile]
  );

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const {
    register,
    handleSubmit,
    getValues,
    watch,

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

  const selectedRole = watch("role");

  const chooseProfileImage = (file?: File) => {
    if (!file) {
      return;
    }

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
    if (!profileFile) {
      return null;
    }

    const formData = new FormData();

    formData.append("image", profileFile);

    const response = await api.post<{
      data: {
        url: string;
      };
    }>("/uploads/images", formData, {
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

    const profile = (
      await api.post<{
        data: Profile;
      }>("/users/onboarding", {
        role: values.role
      })
    ).data.data;

    await refreshAccessToken();

    if (profileFile) {
      try {
        const imageUrl = await uploadProfileImage();

        if (imageUrl) {
          const updateResult = await authClient.updateUser({
            image: imageUrl
          });

          if (updateResult.error) {
            throw new Error(updateResult.error.message || "Profile image could not be saved");
          }
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

    navigate(dashboardPath(profile.role), {
      replace: true
    });
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

        callbackURL: `${window.location.origin}/onboarding`
      });
    } catch (error) {
      setGooglePending(false);

      toast.error(apiErrorMessage(error, "Google registration is not configured"));
    }
  };

  return (
    <main
      className="
        grid
        min-h-screen

        bg-[#d1d8dc]

        text-[#17211d]

        dark:bg-[#09140f]
        dark:text-[#edf4f0]

        lg:grid-cols-[0.96fr_1.04fr]
      "
    >
      {/* CINEMATIC LEFT PANEL */}
      <section
        className="
          relative
          hidden
          min-h-screen
          overflow-hidden

          lg:flex
          lg:flex-col
        "
      >
        {/* Relevant crowdfunding / community image */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
          "
        >
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="
              h-full
              w-full
              object-cover
              object-center

              saturate-[0.72]
              contrast-[1.05]
              brightness-[0.54]
            "
          />

          {/* Forest tint */}
          <div
            className="
              absolute
              inset-0

              bg-[#0b3326]/56
            "
          />

          {/* Cinematic depth */}
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br

              from-[#07140f]/30
              via-[#123629]/18
              to-[#030a07]/82
            "
          />

          {/* Sage atmospheric highlight */}
          <div
            className="
              absolute
              inset-0

              bg-[radial-gradient(circle_at_22%_22%,rgba(167,204,186,0.20),transparent_37%)]
            "
          />
        </div>

        {/* Editorial guide */}
        <div
          aria-hidden="true"
          className="
            absolute
            bottom-0
            right-[12%]
            top-0

            w-px

            bg-white/[0.10]
          "
        />

        <div
          className="
            relative
            z-10

            flex
            min-h-screen
            flex-col

            p-10

            xl:p-12
          "
        >
          <Logo light />

          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              my-auto

              max-w-2xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  size-9
                  items-center
                  justify-center

                  rounded-full

                  bg-[#d6e3dd]

                  text-[#10261f]
                "
              >
                <Sparkles className="size-4" />
              </div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.22em]

                  text-[#b9ccc3]
                "
              >
                Join the community
              </p>
            </div>

            <h1
              className="
                display-heading

                mt-6

                max-w-2xl

                text-[clamp(4rem,5.9vw,6.8rem)]
                leading-[0.84]

                text-white
              "
            >
              Turn support
              <br />
              into impact.
            </h1>

            <p
              className="
                mt-6

                max-w-lg

                text-base
                leading-7

                text-[#c5d5cd]
              "
            >
              Join as a supporter to discover and fund meaningful campaigns, or become a creator and
              bring your own idea to the community.
            </p>

            <div
              className="
                mt-8
                grid
                max-w-lg
                grid-cols-2
                gap-3
              "
            >
              <div
                className="
                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.06]

                  p-4

                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    size-8
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]
                  "
                >
                  <Users className="size-4" />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Supporters
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5

                    text-[#afc3b9]
                  "
                >
                  Start with 50 credits.
                </p>
              </div>

              <div
                className="
                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.06]

                  p-4

                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    flex
                    size-8
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]
                  "
                >
                  <Rocket className="size-4" />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Creators
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5

                    text-[#afc3b9]
                  "
                >
                  Start with 20 credits.
                </p>
              </div>
            </div>
          </motion.div>

          <div
            className="
              flex
              items-center
              justify-between

              border-t
              border-white/10

              pt-5

              text-xs

              text-[#9eb4aa]
            "
          >
            <span>CrowdSpark</span>

            <span>Ideas powered by community</span>
          </div>
        </div>
      </section>

      {/* REGISTRATION PANEL */}
      <section
        className="
          relative

          flex
          min-h-screen
          items-center
          justify-center

          overflow-hidden

          px-5
          py-16

          sm:px-8

          lg:px-10
          lg:py-8

          dark:bg-[#0c1813]
        "
      >
        {/* Background atmosphere */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              -right-40
              -top-40

              size-[500px]

              rounded-full

              bg-[#789889]/14

              blur-[120px]

              dark:bg-[#38624f]/9
            "
          />

          <div
            className="
              absolute
              -bottom-44
              -left-44

              size-[460px]

              rounded-full

              bg-[#97afa4]/10

              blur-[120px]

              dark:bg-[#1c4936]/10
            "
          />
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.99
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.65,
            delay: 0.06,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            relative
            z-10

            w-full
            max-w-[640px]
          "
        >
          {/* Mobile logo */}
          <div
            className="
              mb-7
              lg:hidden
            "
          >
            <Logo />
          </div>

          {/* Heading */}
          <div>
            <p className="editorial-label">Create account</p>

            <h2
              className="
                display-heading

                mt-2.5

                text-[clamp(3rem,4.5vw,4.4rem)]
                leading-[0.9]
              "
            >
              Join CrowdSpark.
            </h2>

            <p
              className="
                mt-3

                text-sm
                leading-6

                text-[#5c6b64]

                dark:text-[#aebfb7]
              "
            >
              Choose how you want to participate and create your account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(submit)}
            className="
              relative

              mt-5

              overflow-hidden

              rounded-[24px]

              border
              border-[#aebcb6]/55

              bg-[#e8edeb]/72

              p-5

              shadow-[0_20px_60px_rgba(35,54,46,0.08)]

              backdrop-blur-xl

              sm:p-6

              dark:border-white/10
              dark:bg-[#14231d]/72
              dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]
            "
          >
            {/* ROLE SELECTION */}
            <div>
              <p className={labelClass}>Choose your role</p>

              <div
                className="
                  grid
                  gap-3

                  sm:grid-cols-2
                "
              >
                <label
                  className={`
                    group
                    relative

                    cursor-pointer

                    rounded-2xl

                    border

                    p-4

                    transition-all
                    duration-200

                    ${
                      selectedRole === "supporter"
                        ? `
                            border-[#527064]
                            bg-[#dce6e1]

                            shadow-[0_8px_24px_rgba(32,53,45,0.07)]

                            dark:border-[#8aa698]
                            dark:bg-[#20372d]
                          `
                        : `
                            border-[#bbc6c1]

                            bg-white/30

                            hover:border-[#83998f]
                            hover:bg-white/50

                            dark:border-[#30443b]
                            dark:bg-white/[0.02]
                            dark:hover:border-[#587166]
                            dark:hover:bg-white/[0.04]
                          `
                    }
                  `}
                >
                  <input type="radio" value="supporter" {...register("role")} className="sr-only" />

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        size-9
                        items-center
                        justify-center

                        rounded-full

                        bg-[#d6e3dd]

                        text-[#10261f]
                      "
                    >
                      <Users className="size-4" />
                    </div>

                    <div
                      className={`
                        flex
                        size-5
                        items-center
                        justify-center

                        rounded-full

                        border

                        ${
                          selectedRole === "supporter"
                            ? `
                                border-[#20352d]
                                bg-[#20352d]
                                text-white

                                dark:border-[#d6e3dd]
                                dark:bg-[#d6e3dd]
                                dark:text-[#10261f]
                              `
                            : `
                                border-[#9aaba3]
                                text-transparent
                              `
                        }
                      `}
                    >
                      <Check className="size-3" />
                    </div>
                  </div>

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                    "
                  >
                    Supporter
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5

                      text-[#62716a]

                      dark:text-[#9caea5]
                    "
                  >
                    Discover campaigns and fund meaningful ideas.
                  </p>

                  <p
                    className="
                      mt-3
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      text-[#426454]

                      dark:text-[#a9c2b6]
                    "
                  >
                    +50 starting credits
                  </p>
                </label>

                <label
                  className={`
                    group
                    relative

                    cursor-pointer

                    rounded-2xl

                    border

                    p-4

                    transition-all
                    duration-200

                    ${
                      selectedRole === "creator"
                        ? `
                            border-[#527064]
                            bg-[#dce6e1]

                            shadow-[0_8px_24px_rgba(32,53,45,0.07)]

                            dark:border-[#8aa698]
                            dark:bg-[#20372d]
                          `
                        : `
                            border-[#bbc6c1]

                            bg-white/30

                            hover:border-[#83998f]
                            hover:bg-white/50

                            dark:border-[#30443b]
                            dark:bg-white/[0.02]
                            dark:hover:border-[#587166]
                            dark:hover:bg-white/[0.04]
                          `
                    }
                  `}
                >
                  <input type="radio" value="creator" {...register("role")} className="sr-only" />

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        size-9
                        items-center
                        justify-center

                        rounded-full

                        bg-[#d6e3dd]

                        text-[#10261f]
                      "
                    >
                      <Rocket className="size-4" />
                    </div>

                    <div
                      className={`
                        flex
                        size-5
                        items-center
                        justify-center

                        rounded-full

                        border

                        ${
                          selectedRole === "creator"
                            ? `
                                border-[#20352d]
                                bg-[#20352d]
                                text-white

                                dark:border-[#d6e3dd]
                                dark:bg-[#d6e3dd]
                                dark:text-[#10261f]
                              `
                            : `
                                border-[#9aaba3]
                                text-transparent
                              `
                        }
                      `}
                    >
                      <Check className="size-3" />
                    </div>
                  </div>

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                    "
                  >
                    Creator
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5

                      text-[#62716a]

                      dark:text-[#9caea5]
                    "
                  >
                    Launch campaigns and manage community funding.
                  </p>

                  <p
                    className="
                      mt-3
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]

                      text-[#426454]

                      dark:text-[#a9c2b6]
                    "
                  >
                    +20 starting credits
                  </p>
                </label>
              </div>
            </div>

            {/* NAME + EMAIL */}
            <div
              className="
                mt-4
                grid
                gap-4

                sm:grid-cols-2
              "
            >
              <div>
                <label htmlFor="register-name" className={labelClass}>
                  Full name
                </label>

                <input
                  id="register-name"
                  className={fieldClass}
                  autoComplete="name"
                  placeholder="Your name"
                  {...register("name")}
                />

                {errors.name ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="register-email" className={labelClass}>
                  Email address
                </label>

                <input
                  id="register-email"
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />

                {errors.email ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* PROFILE IMAGE */}
            <section
              className="
                mt-4

                rounded-2xl

                border
                border-[#bbc6c1]

                bg-white/25

                p-4

                dark:border-[#30443b]
                dark:bg-white/[0.02]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p className={labelClass}>Profile image</p>

                  <p
                    className="
                      text-xs
                      text-[#6b7973]

                      dark:text-[#8fa198]
                    "
                  >
                    Optional · JPEG, PNG or WebP · Max 3 MB
                  </p>
                </div>

                <ImagePlus
                  className="
                    size-4

                    text-[#527064]

                    dark:text-[#91aa9d]
                  "
                />
              </div>

              {previewUrl ? (
                <div
                  className="
                    mt-3

                    flex
                    items-center
                    gap-4
                  "
                >
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="
                      size-16

                      rounded-2xl

                      border
                      border-[#aebbb5]

                      object-cover

                      dark:border-[#40564c]
                    "
                  />

                  <div>
                    <p
                      className="
                        max-w-[260px]
                        truncate

                        text-sm
                        font-semibold
                      "
                    >
                      {profileFile?.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => setProfileFile(null)}
                      className="
                        mt-2

                        inline-flex
                        items-center
                        gap-1.5

                        text-xs
                        font-semibold

                        text-red-600

                        transition

                        hover:text-red-700

                        dark:text-red-400
                        dark:hover:text-red-300
                      "
                    >
                      <Trash2 className="size-3.5" />
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className="
                    mt-3

                    flex
                    min-h-[74px]
                    cursor-pointer

                    items-center
                    justify-center
                    gap-3

                    rounded-xl

                    border
                    border-dashed
                    border-[#9aaba3]

                    bg-white/25

                    px-4

                    text-sm
                    font-semibold

                    text-[#526159]

                    transition-all

                    hover:border-[#59786a]
                    hover:bg-white/45

                    dark:border-[#40574d]
                    dark:bg-white/[0.02]
                    dark:text-[#aabbb2]

                    dark:hover:border-[#789488]
                    dark:hover:bg-white/[0.04]
                  "
                >
                  <ImagePlus
                    className="
                      size-5

                      text-[#527064]

                      dark:text-[#91aa9d]
                    "
                  />
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
                <div className="mt-3">
                  <div
                    className="
                      h-1.5

                      overflow-hidden
                      rounded-full

                      bg-[#bdc9c4]

                      dark:bg-[#26372f]
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full

                        bg-[#20352d]

                        transition-all

                        dark:bg-[#d6e3dd]
                      "
                      style={{
                        width: `${uploadProgress}%`
                      }}
                    />
                  </div>

                  <p
                    className="
                      mt-1.5

                      text-xs
                      font-semibold

                      text-[#426454]

                      dark:text-[#a9c2b6]
                    "
                  >
                    Uploading {uploadProgress}%
                  </p>
                </div>
              ) : null}
            </section>

            {/* PASSWORDS */}
            <div
              className="
                mt-4
                grid
                gap-4

                sm:grid-cols-2
              "
            >
              <div>
                <label htmlFor="register-password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <input
                    id="register-password"
                    className={`
                      ${fieldClass}
                      pr-11
                    `}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="
                      absolute
                      right-3
                      top-1/2

                      flex
                      size-8
                      -translate-y-1/2
                      items-center
                      justify-center

                      rounded-full

                      text-[#68766f]

                      transition

                      hover:bg-[#20352d]/8
                      hover:text-[#20352d]

                      dark:text-[#91a49b]
                      dark:hover:bg-white/5
                      dark:hover:text-white
                    "
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {errors.password ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="register-confirm" className={labelClass}>
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="register-confirm"
                    className={`
                      ${fieldClass}
                      pr-11
                    `}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    {...register("confirm")}
                  />

                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirm((value) => !value)}
                    className="
                      absolute
                      right-3
                      top-1/2

                      flex
                      size-8
                      -translate-y-1/2
                      items-center
                      justify-center

                      rounded-full

                      text-[#68766f]

                      transition

                      hover:bg-[#20352d]/8
                      hover:text-[#20352d]

                      dark:text-[#91a49b]
                      dark:hover:bg-white/5
                      dark:hover:text-white
                    "
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {errors.confirm ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.confirm.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* TERMS */}
            <div className="mt-4">
              <label
                className="
                  flex
                  items-start
                  gap-3

                  text-xs
                  leading-5

                  text-[#5d6c65]

                  dark:text-[#9aaca3]
                "
              >
                <input
                  type="checkbox"
                  {...register("accepted")}
                  className="
                    mt-0.5
                    size-4
                    shrink-0

                    accent-[#20352d]
                  "
                />

                <span>
                  I accept the{" "}
                  <Link
                    className="
                      font-bold

                      text-[#315d4c]

                      hover:underline

                      dark:text-[#bdd2c8]
                    "
                    to="/terms"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="
                      font-bold

                      text-[#315d4c]

                      hover:underline

                      dark:text-[#bdd2c8]
                    "
                    to="/privacy"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {errors.accepted ? (
                <p
                  className="
                    mt-1.5
                    text-xs
                    text-red-600

                    dark:text-red-400
                  "
                >
                  {errors.accepted.message}
                </p>
              ) : null}
            </div>

            {/* ACTIONS */}
            <div
              className="
                mt-5
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <motion.button
                type="submit"
                disabled={isSubmitting || googlePending}
                whileHover={
                  isSubmitting || googlePending
                    ? undefined
                    : {
                        y: -1
                      }
                }
                whileTap={
                  isSubmitting || googlePending
                    ? undefined
                    : {
                        scale: 0.985
                      }
                }
                className="
                  group

                  flex
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  bg-[#20352d]

                  px-5
                  py-3.5

                  text-sm
                  font-bold
                  text-white

                  shadow-[0_12px_30px_rgba(32,53,45,0.16)]

                  transition-all

                  hover:bg-[#2d493e]

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                  dark:hover:bg-[#edf5f1]
                "
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}

                {isSubmitting ? "Creating..." : "Create account"}

                {!isSubmitting ? (
                  <ArrowRight
                    className="
                      size-4

                      transition-transform

                      group-hover:translate-x-0.5
                    "
                  />
                ) : null}
              </motion.button>

              <button
                type="button"
                disabled={isSubmitting || googlePending}
                onClick={() => void google()}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2.5

                  rounded-full

                  border
                  border-[#aebcb6]

                  bg-white/45

                  px-5
                  py-3.5

                  text-sm
                  font-semibold

                  text-[#26362f]

                  transition-all

                  hover:border-[#80958b]
                  hover:bg-white/75

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:border-[#35483f]
                  dark:bg-white/[0.035]
                  dark:text-[#e7efeb]

                  dark:hover:border-[#637d71]
                  dark:hover:bg-white/[0.06]
                "
              >
                {googlePending ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleIcon />}

                {googlePending ? "Opening Google..." : "Continue with Google"}
              </button>
            </div>
          </form>

          {/* LOGIN LINK */}
          <p
            className="
              mt-5

              text-center
              text-sm

              text-[#5e6d66]

              dark:text-[#91a49b]
            "
          >
            Already registered?{" "}
            <Link
              className="
                font-bold

                text-[#315d4c]

                transition-colors

                hover:text-[#173d30]

                dark:text-[#bdd2c8]
                dark:hover:text-white
              "
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-1.99 3.02v2.54h3.23c1.89-1.74 2.98-4.3 2.98-7.41Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.23-2.54c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.03 6.03 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.05A10 10 0 0 0 2 12c0 1.61.38 3.13 1.05 4.55l3.34-2.62Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.45l3.34 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}
