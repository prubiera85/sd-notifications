import type { SlackMessage } from "@/types";

/**
 * Format a service desk notification for Slack
 * Uses Slack Block Kit for rich formatting
 */
export function formatServiceDeskNotification(
  issue: any,
  comment: any,
  matchedTags: string[]
): SlackMessage {
  // Truncate comment body if too long
  const maxLength = 300;
  const commentBody = comment.body || "";
  const truncatedComment =
    commentBody.length > maxLength
      ? commentBody.substring(0, maxLength) + "..."
      : commentBody;

  // Highlight matched tags in the comment
  let highlightedComment = truncatedComment;
  matchedTags.forEach((tag) => {
    const regex = new RegExp(tag, "gi");
    highlightedComment = highlightedComment.replace(regex, `*${tag}*`);
  });

  const message: SlackMessage = {
    text: `🔔 Service Desk Mention in ${issue.identifier}: ${issue.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔔 Service Desk Mention",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${issue.url}|${issue.identifier}: ${issue.title}>*`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Status:*\n${issue.state?.name || "Unknown"}`,
          },
          {
            type: "mrkdwn",
            text: `*Priority:*\n${getPriorityLabel(issue.priority)}`,
          },
          {
            type: "mrkdwn",
            text: `*Assignee:*\n${issue.assignee?.name || "Unassigned"}`,
          },
          {
            type: "mrkdwn",
            text: `*Tags:*\n${matchedTags.join(", ")}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Comment by ${comment.user?.name || "Unknown"}:*\n${highlightedComment}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open in Linear",
            },
            url: issue.url,
            action_id: "open_linear",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `<!date^${Math.floor(new Date(comment.createdAt).getTime() / 1000)}^{date_short_pretty} at {time}|${comment.createdAt}>`,
          },
        ],
      },
    ],
  };

  return message;
}

/**
 * Convert Linear priority number to human-readable label
 */
function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 0:
      return "🔵 None";
    case 1:
      return "🔴 Urgent";
    case 2:
      return "🟠 High";
    case 3:
      return "🟡 Normal";
    case 4:
      return "⚪ Low";
    default:
      return "Unknown";
  }
}
