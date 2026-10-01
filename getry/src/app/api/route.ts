import { NextResponse } from "next/server";

/* the pages export gate: the static mirror answers the route as a frozen
 * snapshot; the live gateway api answers on the standalone deploy target. */
export const dynamic = process.env.PAGES_EXPORT === "1" ? "force-static" : "force-dynamic";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}