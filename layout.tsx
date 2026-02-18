import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

// Metadata for the YTBulkUploader BETA application. These values appear in
// the browser tab title and can influence search engine previews.
export const metadata: Metadata = {
  title: "YTBulkUploader BETA",
  description: "Upload videos to YouTube in bulk using a modern interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
