"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import TicketCard from "./TicketCard";
import FilterBar from "./FilterBar";

interface TicketData {
  comment: any;
  issue: any;
  matchedTags: string[];
}

interface TicketListProps {
  tickets: TicketData[];
  fetchTime: string;
}

const TICKETS_PER_PAGE = 20;

export default function TicketList({ tickets, fetchTime }: TicketListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d">("7d");
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing dashboard...");
      router.refresh();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, [router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, dateRange]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tickets.forEach((ticket) => {
      ticket.matchedTags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    console.log(`Filtering ${tickets.length} tickets with dateRange: ${dateRange}`);
    let filtered = [...tickets];

    // Filter by date range
    const now = new Date();
    const dateThreshold = new Date();

    switch (dateRange) {
      case "24h":
        dateThreshold.setHours(now.getHours() - 24);
        break;
      case "7d":
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case "30d":
        dateThreshold.setDate(now.getDate() - 30);
        break;
    }

    console.log(`Date threshold for ${dateRange}:`, dateThreshold);

    filtered = filtered.filter((ticket) => {
      const commentDate = new Date(ticket.comment.createdAt);
      const passes = commentDate >= dateThreshold;
      if (!passes) {
        console.log(`Filtering out ticket from ${commentDate} (threshold: ${dateThreshold})`);
      }
      return passes;
    });

    console.log(`After date filter: ${filtered.length} tickets`);

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter((ticket) =>
        ticket.matchedTags.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.issue.title.toLowerCase().includes(query) ||
          ticket.issue.identifier.toLowerCase().includes(query) ||
          ticket.comment.body?.toLowerCase().includes(query)
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => {
      return (
        new Date(b.comment.createdAt).getTime() -
        new Date(a.comment.createdAt).getTime()
      );
    });

    return filtered;
  }, [tickets, dateRange, selectedTag, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTickets.length / TICKETS_PER_PAGE);
  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
  const endIndex = startIndex + TICKETS_PER_PAGE;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        allTags={allTags}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => {
          console.log("Manual refresh triggered");
          router.refresh();
        }}
      />

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-blue-800 dark:text-blue-200">
            <span className="font-medium">Based on last 30 days of comments</span>
            <span className="mx-2">•</span>
            <span>Auto-refreshes every 5 minutes</span>
          </div>
          <div className="text-blue-600 dark:text-blue-400 text-xs">
            Updated: {new Date(fetchTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Ticket Cards */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tickets found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {tickets.length === 0
              ? "No comments with service desk tags in the selected time period."
              : "Try adjusting your filters or search query."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} tickets
            </p>
            <p>
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="space-y-4">
            {paginatedTickets.map((ticket) => (
              <TicketCard
                key={`${ticket.issue.id}-${ticket.comment.id}`}
                issue={ticket.issue}
                comment={ticket.comment}
                matchedTags={ticket.matchedTags}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
