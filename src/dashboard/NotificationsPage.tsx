import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  CircleCheck,
  LoaderCircle,
  RefreshCw
} from "lucide-react";

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

import type { NotificationItem } from "../types";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications-all"],

    queryFn: async () =>
      (
        await api.get<{
          data: NotificationItem[];
        }>("/notifications", {
          params: {
            limit: 50
          }
        })
      ).data.data
  });

  const all = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),

    onSuccess: async () => {
      toast.success("All notifications marked as read");

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["notifications-all"]
        }),

        qc.invalidateQueries({
          queryKey: ["notification-count"]
        })
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const notifications = query.data ?? [];

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const readCount = notifications.length - unreadCount;

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

          rounded-[26px]

          border
          border-white/10

          bg-[#173329]

          px-6
          py-6

          text-white

          shadow-[0_20px_55px_rgba(23,51,41,0.12)]

          sm:px-7

          dark:bg-[#0d1c16]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24

            size-72

            rounded-full

            bg-[#91aa9d]/14

            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-32
            left-[35%]

            size-72

            rounded-full

            bg-[#527064]/10

            blur-3xl
          "
        />

        <div
          className="
            relative

            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#9fb6ab]
              "
            >
              Activity center
            </p>

            <h1
              className="
                display-heading

                mt-2

                text-[clamp(2.8rem,5vw,4.6rem)]
                leading-[0.9]
              "
            >
              Notifications.
            </h1>

            <p
              className="
                mt-3
                max-w-2xl

                text-sm
                leading-6

                text-[#b9ccc3]
              "
            >
              Stay updated on campaign activity, payments, moderation events and account-related
              actions.
            </p>
          </div>

          <div
            className="
              flex
              gap-3
            "
          >
            <div
              className="
                rounded-2xl

                border
                border-white/10

                bg-white/[0.06]

                px-4
                py-3

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
                Unread
              </p>

              <p
                className="
                  mt-1

                  text-xl
                  font-semibold

                  tracking-[-0.04em]

                  text-white
                "
              >
                {unreadCount}
              </p>
            </div>

            <div
              className="
                rounded-2xl

                border
                border-white/10

                bg-white/[0.06]

                px-4
                py-3

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
                Total
              </p>

              <p
                className="
                  mt-1

                  text-xl
                  font-semibold

                  tracking-[-0.04em]

                  text-white
                "
              >
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY + ACTION */}
      <section
        className="
          campaign-surface

          flex
          flex-col
          gap-4

          p-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
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
            <BellRing className="size-[17px]" />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold

                text-[var(--editorial-text)]
              "
            >
              Notification inbox
            </p>

            <p
              className="
                mt-1

                text-xs

                text-[var(--editorial-muted)]
              "
            >
              {unreadCount ? `${unreadCount} unread · ${readCount} read` : "You're all caught up."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={all.isPending || unreadCount === 0}
          onClick={() => all.mutate()}
          className="
            editorial-button

            shrink-0

            disabled:cursor-not-allowed
            disabled:opacity-45
          "
        >
          {all.isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCheck className="size-4" />
              Mark all read
            </>
          )}
        </button>
      </section>

      {/* LIST */}
      {query.isLoading ? (
        <NotificationLoading />
      ) : query.isError ? (
        <section
          className="
            campaign-surface

            px-6
            py-12

            text-center
          "
        >
          <div
            className="
              mx-auto

              flex
              size-11
              items-center
              justify-center

              rounded-full

              bg-red-100

              text-red-700

              dark:bg-red-400/10
              dark:text-red-300
            "
          >
            <Bell className="size-5" />
          </div>

          <h2
            className="
              display-heading

              mt-4

              text-4xl
            "
          >
            Notifications unavailable.
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md

              text-sm
              leading-6

              text-[var(--editorial-muted)]
            "
          >
            CrowdSpark could not load your notifications.
          </p>

          <button
            type="button"
            onClick={() => void query.refetch()}
            className="
              editorial-button

              mt-5
            "
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </section>
      ) : notifications.length ? (
        <section
          className="
            campaign-surface

            overflow-hidden
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4

              border-b
              border-[var(--editorial-border)]

              px-5
              py-4
            "
          >
            <div>
              <p className="editorial-label">Recent activity</p>

              <h2
                className="
                  display-heading

                  mt-1

                  text-3xl
                  leading-none
                "
              >
                Notification feed
              </h2>
            </div>

            {query.isFetching ? (
              <LoaderCircle
                className="
                  size-4
                  animate-spin

                  text-[var(--editorial-muted)]
                "
              />
            ) : null}
          </div>

          <div
            className="
              divide-y
              divide-[var(--editorial-border)]
            "
          >
            {notifications.map((notification, index) => (
              <motion.article
                key={notification.id}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.32,
                  delay: index * 0.025
                }}
                className={`
                    group
                    relative

                    px-5
                    py-5

                    transition-colors

                    ${
                      notification.isRead
                        ? `
                            bg-transparent

                            hover:bg-white/20

                            dark:hover:bg-white/[0.02]
                          `
                        : `
                            bg-[#dce8e2]/45

                            hover:bg-[#dce8e2]/65

                            dark:bg-[#78988a]/[0.07]
                            dark:hover:bg-[#78988a]/[0.10]
                          `
                    }
                  `}
              >
                {!notification.isRead ? (
                  <span
                    aria-hidden="true"
                    className="
                        absolute
                        left-0
                        top-0

                        h-full
                        w-[3px]

                        bg-[#527064]

                        dark:bg-[#91aa9d]
                      "
                  />
                ) : null}

                <div
                  className="
                      flex
                      items-start
                      gap-4
                    "
                >
                  <div
                    className={`
                        flex
                        size-10
                        shrink-0
                        items-center
                        justify-center

                        rounded-full

                        ${
                          notification.isRead
                            ? `
                                border
                                border-[var(--editorial-border)]

                                bg-white/25

                                text-[var(--editorial-muted)]

                                dark:bg-white/[0.03]
                              `
                            : `
                                bg-[#d6e3dd]

                                text-[#10261f]
                              `
                        }
                      `}
                  >
                    {notification.isRead ? (
                      <CircleCheck className="size-[17px]" />
                    ) : (
                      <BellRing className="size-[17px]" />
                    )}
                  </div>

                  <div
                    className="
                        min-w-0
                        flex-1
                      "
                  >
                    <div
                      className="
                          flex
                          flex-col
                          gap-2

                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        "
                    >
                      <div>
                        <div
                          className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                        >
                          <h3
                            className="
                                text-sm
                                font-semibold

                                text-[var(--editorial-text)]
                              "
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead ? (
                            <span
                              className="
                                  inline-flex

                                  rounded-full

                                  bg-[#20352d]

                                  px-2
                                  py-1

                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-[0.12em]

                                  text-white

                                  dark:bg-[#d6e3dd]
                                  dark:text-[#10261f]
                                "
                            >
                              New
                            </span>
                          ) : null}
                        </div>

                        <p
                          className="
                              mt-2
                              max-w-3xl

                              text-sm
                              leading-6

                              text-[var(--editorial-text-soft)]
                            "
                        >
                          {notification.message}
                        </p>
                      </div>

                      <time
                        className="
                            shrink-0

                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.1em]

                            text-[var(--editorial-muted)]
                          "
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>

                    {notification.actionUrl ? (
                      <div className="mt-4">
                        <Link
                          to={notification.actionUrl}
                          className="
                              inline-flex
                              items-center
                              gap-2

                              text-xs
                              font-semibold

                              text-[#426454]

                              transition-all

                              hover:gap-3
                              hover:text-[#20352d]

                              dark:text-[#acc4b8]
                              dark:hover:text-white
                            "
                        >
                          Open details
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      ) : (
        <section
          className="
            campaign-surface

            px-6
            py-14

            text-center
          "
        >
          <div
            className="
              mx-auto

              flex
              size-12
              items-center
              justify-center

              rounded-full

              bg-[#d6e3dd]

              text-[#10261f]
            "
          >
            <CheckCheck className="size-5" />
          </div>

          <h2
            className="
              display-heading

              mt-5

              text-4xl
            "
          >
            Nothing new here.
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-md

              text-sm
              leading-6

              text-[var(--editorial-muted)]
            "
          >
            Notifications about your CrowdSpark activity will appear here when something needs your
            attention.
          </p>
        </section>
      )}
    </motion.main>
  );
}

function NotificationLoading() {
  return (
    <section
      className="
        campaign-surface

        overflow-hidden
      "
    >
      <div
        className="
          border-b
          border-[var(--editorial-border)]

          px-5
          py-4
        "
      >
        <div
          className="
            h-7
            w-48

            animate-pulse

            rounded-lg

            bg-[#c2ccc8]/55

            dark:bg-[#17231e]
          "
        />
      </div>

      <div>
        {Array.from({
          length: 6
        }).map((_, index) => (
          <div
            key={index}
            className="
              border-b
              border-[var(--editorial-border)]

              p-5

              last:border-b-0
            "
          >
            <div
              className="
                h-[82px]
                animate-pulse

                rounded-xl

                bg-[#c2ccc8]/55

                dark:bg-[#17231e]
              "
            />
          </div>
        ))}
      </div>
    </section>
  );
}
