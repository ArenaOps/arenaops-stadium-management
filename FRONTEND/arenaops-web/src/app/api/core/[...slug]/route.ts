import { NextRequest, NextResponse } from "next/server";
import {
  getCoreProxyTarget,
  getServiceConfig,
  isProxyDebugEnabled,
} from "@/lib/server/proxy-config";

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
  const debugEnabled = isProxyDebugEnabled();

  let coreConfig;
  let targetUrl: string;

  try {
    coreConfig = getServiceConfig("core");
    targetUrl = getCoreProxyTarget(slugPath, request.nextUrl.search);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid core proxy configuration";
    console.error("[BFF Core Proxy Config Error]", message);
    return NextResponse.json(
      {
        error: message,
        layer: "proxy-config",
        env: "CORE_SERVICE_URL",
      },
      { status: 500 },
    );
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const token = request.cookies.get("accessToken")?.value;
  if (token && !headers.authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers.host = coreConfig.host;

  try {
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text();

    if (debugEnabled) {
      console.info("[BFF Core Proxy] Forwarding request", {
        method: request.method,
        slugPath,
        targetUrl,
      });
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseBody = await response.text();

    if (debugEnabled) {
      console.info("[BFF Core Proxy] Backend response", {
        targetUrl,
        status: response.status,
        statusText: response.statusText,
      });
    }

    const proxiedResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });

    const setCookies = response.headers.getSetCookie?.() ?? [];
    setCookies.forEach((cookie) =>
      proxiedResponse.headers.append("Set-Cookie", cookie),
    );

    return proxiedResponse;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown core proxy network error";
    console.error("[BFF Core Proxy Network Error]", {
      targetUrl,
      message,
    });
    return NextResponse.json(
      {
        error: "Unable to reach Core Service",
        details: message,
        layer: "network",
        targetUrl,
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return handleProxy(request, slug);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return handleProxy(request, slug);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return handleProxy(request, slug);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return handleProxy(request, slug);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return handleProxy(request, slug);
}
