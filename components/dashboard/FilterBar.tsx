"use client";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  allTags: string[];
  dateRange: "24h" | "7d";
  onDateRangeChange: (range: "24h" | "7d") => void;
  onRefresh: () => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  allTags,
  dateRange,
  onDateRangeChange,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por título, identificador o comentario..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Tag Filter */}
        <div className="lg:w-48">
          <select
            value={selectedTag || ""}
            onChange={(e) => onTagChange(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todas las Etiquetas</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          {(["24h", "7d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          title="Actualizar datos de Linear"
        >
          ↻ Actualizar
        </button>
      </div>
    </div>
  );
}
