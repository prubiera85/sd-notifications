import { fetchRecentComments } from "@/lib/linear/client";
import { serializeTickets } from "@/lib/utils/serialize";
import TicketList from "@/components/dashboard/TicketList";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching for fresh data

export default async function DashboardPage() {
  let tickets: any[] = [];
  let error: string | null = null;
  const fetchTime = new Date().toISOString();

  console.log(`[Dashboard] Fetching data at ${fetchTime}`);

  try {
    // Fetch comments from the last 30 days (filters will narrow this down)
    const rawTickets = await fetchRecentComments(30);
    console.log(`[Dashboard] Fetched ${rawTickets.length} tickets`);
    // Serialize Linear SDK objects to plain objects for client components
    tickets = serializeTickets(rawTickets);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch tickets";
    console.error("Dashboard error:", error);
    tickets = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Service Desk Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Monitoring Linear comments for service desk mentions
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">
              Make sure your LINEAR_API_KEY is configured in environment
              variables.
            </p>
          </div>
        ) : (
          <TicketList tickets={tickets} fetchTime={fetchTime} />
        )}
      </main>
    </div>
  );
}
