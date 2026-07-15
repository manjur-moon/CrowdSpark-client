import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:5000",
  fetchOptions: { credentials: "include" },
  sessionOptions: { refetchOnWindowFocus: true, refetchWhenOffline: false },
  plugins: [jwtClient()]
});
