import { NextResponse } from "next/server";
import { fetchRecentComments } from "@/lib/linear/client";
import { serializeTickets } from "@/lib/utils/serialize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Check for required environment variables
    if (!process.env.LINEAR_API_KEY) {
      return NextResponse.json(
        { error: "LINEAR_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    console.log("[API] Fetching tickets...");
    const rawTickets = await fetchRecentComments(14);
    console.log(`[API] Fetched ${rawTickets.length} tickets`);

    const tickets = serializeTickets(rawTickets);

    return NextResponse.json({
      tickets,
      fetchTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error fetching tickets:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
