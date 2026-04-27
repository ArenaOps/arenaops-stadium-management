import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:5001/api/auth";

const HOP_BY_HOP_HEADERS = [
  "host",
  "connection",
  "expect",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
];

async function handleProxy(request: NextRequest, slug: string[]) {
  const slugPath = slug.join("/");

  // Direct passthrough
  const url = `${AUTH_SERVICE_URL}/${slugPath}${request.nextUrl.search}`;

  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  headers["host"] = new URL(AUTH_SERVICE_URL).host;

  try {
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text();

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });

    const text = await response.text();

    const proxiedResponse = new NextResponse(text, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });

    const setCookies = response.headers.getSetCookie?.() ?? [];
    setCookies.forEach((cookie) =>
      proxiedResponse.headers.append("Set-Cookie", cookie)
    );

    return proxiedResponse;
  } catch (error) {
    console.error("[BFF Auth Proxy Error]", error);

    return NextResponse.json(
      { error: "Failed to proxy request to Auth Service" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: any) {
  return handleProxy(req, (await params).slug);
}

export async function POST(req: NextRequest, { params }: any) {
  return handleProxy(req, (await params).slug);
}

export async function PUT(req: NextRequest, { params }: any) {
  return handleProxy(req, (await params).slug);
}

export async function PATCH(req: NextRequest, { params }: any) {
  return handleProxy(req, (await params).slug);
}

export async function DELETE(req: NextRequest, { params }: any) {
  return handleProxy(req, (await params).slug);
}