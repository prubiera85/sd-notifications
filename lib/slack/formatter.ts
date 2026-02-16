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
  const authorName = comment.user?.name || "Desconocido";
  const priorityLabel = getPriorityLabel(issue.priority);
  const hasPriority = issue.priority !== 0; // 0 = None

  // Build the message text
  let messageText = `*Ticket:* <${issue.url}|${issue.identifier} - ${issue.title}>\n\n*Mencionado por:* ${authorName}`;

  // Only add priority if it's not "None"
  if (hasPriority) {
    messageText += `\n\n*Prioridad:* ${priorityLabel}`;
  }

  const message: SlackMessage = {
    text: `Han mencionado al equipo de SD en un ticket: ${issue.identifier}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔔 Han mencionado al equipo de SD en un ticket",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messageText,
        },
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
