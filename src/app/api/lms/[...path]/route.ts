import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function backendOrigin(): string {
  const b = process.env.BACKEND_URL?.trim().replace(/\/$/, "");
  return b || "http://127.0.0.1:8000";
}

/** Hop-by-hop / forbidden headers — forwarding these breaks `NextResponse` in Node. */
const DROP_REQ = new Set(["host", "connection", "keep-alive", "transfer-encoding", "te", "trailer", "upgrade", "proxy-connection"]);
const DROP_RES = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function forwardRequestHeaders(incoming: Headers): Headers {
  const out = new Headers();
  incoming.forEach((value, key) => {
    if (DROP_REQ.has(key.toLowerCase())) return;
    out.set(key, value);
  });
  return out;
}

function forwardResponseHeaders(upstream: Headers): Headers {
  const out = new Headers();
  upstream.forEach((value, key) => {
    if (DROP_RES.has(key.toLowerCase())) return;
    out.set(key, value);
  });
  return out;
}

async function proxy(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.length ? pathSegments.join("/") : "";
  const target = `${backendOrigin()}/api/v1/${path}${req.nextUrl.search}`;

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: forwardRequestHeaders(req.headers),
      body,
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        detail: `Cannot reach LMS API at ${backendOrigin()}. Start the FastAPI server. (${msg})`,
      },
      { status: 502 },
    );
  }

  try {
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: forwardResponseHeaders(upstream.headers),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { detail: `Proxy error while reading API response: ${msg}` },
      { status: 500 },
    );
  }
}

type RouteCtx = { params: Promise<{ path?: string[] }> };

async function safeProxy(req: NextRequest, ctx: RouteCtx) {
  try {
    const { path = [] } = await ctx.params;
    return await proxy(req, path);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ detail: `LMS proxy failed: ${msg}` }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return safeProxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  return safeProxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return safeProxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return safeProxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return safeProxy(req, ctx);
}
