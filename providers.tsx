"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If env not set, don't crash the app
  if (!clientId) return <>{children}</>;

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}

// ✅ Export BOTH ways so you can’t break it again
export default Providers;
export { Providers };
