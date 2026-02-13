"use client";

import type { Issue, Comment } from "@linear/sdk";

interface TicketCardProps {
  issue: any; // Using any to handle Linear SDK's lazy-loaded properties
  comment: any;
  matchedTags: string[];
}

export default function TicketCard({
  issue,
  comment,
  matchedTags,
}: TicketCardProps) {
  // Format relative time
  const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get priority label and color
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { label: "Urgent", color: "bg-red-500" };
      case 2:
        return { label: "High", color: "bg-orange-500" };
      case 3:
        return { label: "Normal", color: "bg-yellow-500" };
      case 4:
        return { label: "Low", color: "bg-gray-400" };
      default:
        return { label: "None", color: "bg-gray-300" };
    }
  };

  const priorityInfo = getPriorityInfo(issue.priority);

  // Truncate comment
  const maxLength = 300;
  const commentBody = comment.body || "";
  const truncatedComment =
    commentBody.length > maxLength
      ? commentBody.substring(0, maxLength) + "..."
      : commentBody;

  // Highlight matched tags
  let highlightedComment = truncatedComment;
  matchedTags.forEach((tag) => {
    const regex = new RegExp(`(${tag})`, "gi");
    highlightedComment = highlightedComment.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
    );
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {issue.identifier}
            </a>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {issue.title}
            </h3>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>
        </div>

        {/* Priority Badge */}
        <div
          className={`${priorityInfo.color} text-white text-xs px-2 py-1 rounded-full font-medium`}
        >
          {priorityInfo.label}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {matchedTags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Comment */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
        <div
          className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlightedComment }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Open in Linear →
        </a>
      </div>
    </div>
  );
}
