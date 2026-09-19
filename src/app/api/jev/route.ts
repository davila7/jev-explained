import { NextRequest, NextResponse } from "next/server";
import type { ProxyResult } from "@/lib/types";

const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone";

// The TypeSafe API does not allow cross-origin browser calls, so this route
// forwards the request server-side. The API key is passed per request from the
// browser and is never stored on the server.
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-typesafe-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }

  const payload = await req.json();
  const started = performance.now();

  let upstream: Response;
  try {
    upstream = await fetch(TYPESAFE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (err) {
    const result: ProxyResult = {
      ok: false,
      status: 0,
      latencyMs: Math.round(performance.now() - started),
      requestId: null,
      body: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
    return NextResponse.json(result);
  }

  const latencyMs = Math.round(performance.now() - started);
  const text = await upstream.text();
  let body: ProxyResult["body"];
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  const result: ProxyResult = {
    ok: upstream.ok,
    status: upstream.status,
    latencyMs,
    requestId: upstream.headers.get("x-typesafe-request-id"),
    body,
  };
  return NextResponse.json(result);
}
