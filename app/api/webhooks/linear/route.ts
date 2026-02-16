import { NextRequest, NextResponse } from "next/server";
import { validateLinearWebhook, isValidTimestamp } from "@/lib/utils/webhook-validator";
import { getMatchingTags } from "@/lib/linear/filters";
import { fetchIssueById, fetchCommentById } from "@/lib/linear/client";
import { formatServiceDeskNotification } from "@/lib/slack/formatter";
import { sendNotification } from "@/lib/slack/client";
import type { LinearWebhookPayload } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Linear webhook handler
 * Receives webhook events, filters for service desk mentions, and sends Slack notifications
 */
export async function POST(request: NextRequest) {
  console.log("Webhook received");

  try {
    // 1. Get signature and body
    const signature = request.headers.get("linear-signature");
    const body = await request.text();

    // 2. Validate webhook signature
    if (!validateLinearWebhook(signature, body)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 3. Parse payload
    let payload: LinearWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error("Failed to parse webhook payload:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 4. Validate timestamp to prevent replay attacks
    if (payload.webhookTimestamp && !isValidTimestamp(payload.webhookTimestamp)) {
      console.warn("Webhook timestamp too old, possible replay attack");
      return NextResponse.json(
        { error: "Timestamp too old" },
        { status: 400 }
      );
    }

    console.log(`Webhook type: ${payload.type}, action: ${payload.action}`);

    // 5. Filter: only process Comment events
    if (payload.type !== "Comment") {
      console.log("Not a comment event, skipping");
      return NextResponse.json({
        ok: true,
        message: "Not a comment event",
      });
    }

    // 6. Only process create and update actions
    if (payload.action !== "create" && payload.action !== "update") {
      console.log("Not a create or update action, skipping");
      return NextResponse.json({
        ok: true,
        message: "Not a create or update action",
      });
    }

    // 7. Extract comment data
    const commentData = payload.data;

    if (!commentData || !commentData.body) {
      console.log("Comment has no body, skipping");
      return NextResponse.json({
        ok: true,
        message: "Comment has no body",
      });
    }

    console.log("Comment body:", commentData.body.substring(0, 100));

    // 8. Check for monitored tags
    const matchedTags = getMatchingTags(commentData.body);

    if (matchedTags.length === 0) {
      console.log("No monitored tags found, skipping");
      return NextResponse.json({
        ok: true,
        message: "No monitored tags found",
      });
    }

    console.log("Matched tags:", matchedTags);

    // 9. Fetch full issue and comment context
    const issueId = commentData.issueId;
    const commentId = commentData.id;

    if (!issueId) {
      console.error("Comment has no issueId");
      return NextResponse.json({
        ok: true,
        message: "Comment has no issueId",
      });
    }

    if (!commentId) {
      console.error("Comment has no id");
      return NextResponse.json({
        ok: true,
        message: "Comment has no id",
      });
    }

    let issue;
    let comment;
    try {
      issue = await fetchIssueById(issueId);
      comment = await fetchCommentById(commentId);
    } catch (error) {
      console.error("Failed to fetch issue or comment:", error);
      return NextResponse.json(
        { error: "Failed to fetch issue or comment details" },
        { status: 500 }
      );
    }

    // 10. Format and send Slack notification
    try {
      const message = formatServiceDeskNotification(
        issue,
        comment,
        matchedTags
      );

      const result = await sendNotification(message);

      if (!result.success) {
        console.error("Failed to send Slack notification:", result.error);
        return NextResponse.json(
          { error: "Failed to send Slack notification" },
          { status: 500 }
        );
      }

      console.log("Successfully processed webhook and sent notification");

      return NextResponse.json({
        ok: true,
        notified: true,
        issueIdentifier: issue.identifier,
        matchedTags,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, linear-signature",
      },
    }
  );
}
