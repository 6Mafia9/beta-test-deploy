"use client";

import { useEffect } from "react";

/**
 * Root page for YTBulkUploader BETA.
 *
 * Next.js uses `app/page.tsx` to render the root route (`/`). In this
 * application the main UI is implemented as a static HTML file (`index.html`) in
 * the `public` directory. To ensure users who navigate to the root path see
 * the new UI, this component simply redirects the browser to that static
 * page. A fallback message is displayed while the redirect happens.
 */
export default function Page() {
  useEffect(() => {
    // Redirect to the static HTML version of the uploader. Using
    // location.replace() avoids adding an extra entry to the browser's
    // history and preserves back button behaviour.
    if (typeof window !== "undefined") {
      window.location.replace("/index.html");
    }
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
      }}
    >
      Redirecting…
    </div>
  );
}