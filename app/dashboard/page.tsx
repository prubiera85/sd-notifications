"use client";

import { useState, useEffect, useCallback } from "react";
import TicketList from "@/components/dashboard/TicketList";
import Link from "next/link";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetchTime, setFetchTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadTickets = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/tickets", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tickets");
      }

      setTickets(data.tickets);
      setFetchTime(data.fetchTime);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets");
      console.error("[Dashboard] Error:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial load
  useEffect(() => {
    if (!mounted) return;
    loadTickets(false);
  }, [mounted, loadTickets]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      console.log("Auto-refreshing dashboard...");
      loadTickets(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [mounted, loadTickets]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    loadTickets(true);
  }, [loadTickets]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            </div>
          </div>
        </header>
      </div>
    );
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

      {/* Refreshing indicator - subtle, non-intrusive */}
      {refreshing && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Refreshing...</span>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            {/* Spinner */}
            <div className="relative w-20 h-20 mb-6">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>

            {/* Loading text */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Fetching recent comments from Linear with service desk tags
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center max-w-md mt-3">
              ⏱️ This may take a moment as we scan the last 7 days of comments
            </p>

            {/* Skeleton placeholders */}
            <div className="w-full max-w-4xl mt-12 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ Error Loading Dashboard
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4 font-mono text-sm">
              {error}
            </p>
            <button
              onClick={() => loadTickets(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            fetchTime={fetchTime}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}
