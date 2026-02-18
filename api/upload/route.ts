import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanTitle(filename: string) {
  const base = path.parse(filename).name;
  return base.replace(/\s+/g, " ").trim().slice(0, 95);
}

function clampPrivacy(p: string | null) {
  const normalized = (p || "").trim().toLowerCase();
  if (normalized === "public" || normalized === "pub") return "public";
  if (normalized === "unlisted" || normalized === "unl") return "unlisted";
  if (normalized === "private" || normalized === "pri") return "private";
  return "private";
}

async function toUploadStream(file: File) {
  const fromWeb = (
    Readable as unknown as {
      fromWeb?: (stream: ReadableStream<Uint8Array>) => Readable;
    }
  ).fromWeb;
  if (typeof fromWeb === "function") {
    return fromWeb(file.stream() as ReadableStream<Uint8Array>);
  }
  return Readable.from(Buffer.from(await file.arrayBuffer()));
}

type UploadResult = {
  ok: true;
  file: string;
  title: string;
  privacy: "public" | "unlisted" | "private";
  videoId: string | null | undefined;
};

export async function GET() {
  return NextResponse.json({ ok: true, msg: "Upload route is alive. Use POST." });
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Bearer token" }, { status: 401 });
    }

    const form = await req.formData();
    const files = form.getAll("files").filter(Boolean) as File[];

    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: "No files received (field name must be 'files')" },
        { status: 400 }
      );
    }

    const privacy = clampPrivacy((form.get("privacy") as string) || "private");
    const customTitle = (form.get("title") as string)?.trim();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const results: UploadResult[] = [];

    for (const file of files) {
      const title =
        customTitle && customTitle.length > 0
          ? customTitle.slice(0, 100)
          : cleanTitle(file.name || "video");

      const stream = await toUploadStream(file);

      const uploadRes = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: { title, description: "" },
          status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
        },
        media: { body: stream },
      });

      results.push({
        ok: true,
        file: file.name,
        title,
        privacy,
        videoId: uploadRes.data.id,
      });
    }

    return NextResponse.json({ ok: true, count: results.length, results });
  } catch (err: unknown) {
    const errorObj = err as {
      message?: string;
      code?: number | string;
      response?: { status?: number | string };
    };
    const message = errorObj?.message || "Upload failed";
    const statusCode =
      Number(errorObj?.code || errorObj?.response?.status || 0) ||
      (/invalid credentials|unauthorized/i.test(message) ? 401 : 500);
    const status = statusCode >= 400 && statusCode <= 599 ? statusCode : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
