import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export const runtime = "nodejs"; // important (NOT edge)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const accessToken = form.get("accessToken") as string | null;
    const title = (form.get("title") as string | null) || "Fortnite";
    const file = form.get("file") as File | null;

    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description: "Uploaded with YT Uploader Web",
          categoryId: "20",
        },
        status: {
          privacyStatus: "private",
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: file.type || "video/mp4",
        body: Readable.from(buffer),
      },
    });

    return NextResponse.json({
      ok: true,
      videoId: res.data.id,
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
