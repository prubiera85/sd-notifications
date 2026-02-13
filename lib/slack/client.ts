import { IncomingWebhook } from "@slack/webhook";
import type { SlackMessage } from "@/types";

let slackClient: IncomingWebhook | null = null;

/**
 * Get Slack webhook client instance (singleton)
 */
export function getSlackClient(): IncomingWebhook {
  if (!slackClient) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("SLACK_WEBHOOK_URL environment variable is not set");
    }

    slackClient = new IncomingWebhook(webhookUrl);
  }

  return slackClient;
}

/**
 * Send a notification to Slack
 */
export async function sendNotification(
  payload: SlackMessage
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSlackClient();

    await client.send({
      text: payload.text,
      blocks: payload.blocks,
    });

    console.log("Slack notification sent successfully");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send Slack notification:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Validate Slack webhook URL format
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "hooks.slack.com" &&
      parsed.pathname.startsWith("/services/")
    );
  } catch {
    return false;
  }
}
