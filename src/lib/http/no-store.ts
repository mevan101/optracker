import { NextResponse } from "next/server";

const HEADERS = { "Cache-Control": "no-store, max-age=0" };

export function jsonNoStore(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: HEADERS });
}
