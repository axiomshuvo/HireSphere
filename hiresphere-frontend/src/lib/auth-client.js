import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // Automatically use the current window origin in the browser to avoid port conflicts (e.g. localhost:3001)
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
