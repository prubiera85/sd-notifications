import { LinearClient, Issue, Comment } from "@linear/sdk";
import { getMatchingTags } from "./filters";

let linearClient: LinearClient | null = null;

/**
 * Get Linear SDK client instance (singleton)
 */
export function getLinearClient(): LinearClient {
  if (!linearClient) {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }

    linearClient = new LinearClient({
      apiKey,
    });
  }

  return linearClient;
}

/**
 * Fetch an issue by ID with full details
 */
export async function fetchIssueById(issueId: string): Promise<Issue> {
  const client = getLinearClient();
  const issue = await client.issue(issueId);

  if (!issue) {
    throw new Error(`Issue not found: ${issueId}`);
  }

  return issue;
}

/**
 * Fetch recent comments from the last N days
 * Returns comments that contain monitored hashtags
 */
export async function fetchRecentComments(daysBack: number = 7) {
  const client = getLinearClient();
  const teamId = process.env.LINEAR_TEAM_ID;

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  try {
    // Fetch comments
    let commentsQuery;

    if (teamId) {
      // Filter by team if specified
      const team = await client.team(teamId);
      const issuesConnection = await team.issues();

      const allComments: Array<{
        comment: any;
        issue: any;
        matchedTags: string[];
      }> = [];

      // Iterate through issues and their comments
      for await (const issue of issuesConnection.nodes) {
        const commentsConnection = await issue.comments();

        for await (const comment of commentsConnection.nodes) {
          const commentDate = new Date(comment.createdAt);

          if (commentDate >= dateThreshold) {
            const matchedTags = getMatchingTags(comment.body || "");

            if (matchedTags.length > 0) {
              // Fetch user and state information
              const user = await comment.user;
              const state = await issue.state;
              const assignee = await issue.assignee;

              allComments.push({
                comment: {
                  ...comment,
                  _user: user,
                },
                issue: {
                  ...issue,
                  _state: state,
                  _assignee: assignee,
                },
                matchedTags,
              });
            }
          }
        }
      }

      return allComments;
    } else {
      // Fetch all comments from the organization
      // Using a large limit to get more historical data
      commentsQuery = await client.comments({
        filter: {
          createdAt: {
            gte: dateThreshold,
          },
        },
        first: 250, // Linear's maximum per request
      });

      console.log(`Fetched ${commentsQuery.nodes.length} total comments from Linear`);

      const filteredComments: Array<{
        comment: any;
        issue: any;
        matchedTags: string[];
      }> = [];

      // Collect all comments (handle pagination)
      let allComments = [...commentsQuery.nodes];
      let hasNextPage = commentsQuery.pageInfo.hasNextPage;
      let endCursor = commentsQuery.pageInfo.endCursor;

      // Fetch additional pages if needed (max 500 comments for Netlify timeout limits)
      // On Netlify free tier, functions timeout after 10 seconds
      let pageCount = 1;
      const maxPages = 2; // 250 * 2 = 500 comments max

      while (hasNextPage && pageCount < maxPages) {
        console.log(`Fetching page ${pageCount + 1} (cursor: ${endCursor})...`);
        const nextPage = await client.comments({
          filter: {
            createdAt: {
              gte: dateThreshold,
            },
          },
          first: 250,
          after: endCursor,
        });
        allComments = [...allComments, ...nextPage.nodes];
        hasNextPage = nextPage.pageInfo.hasNextPage;
        endCursor = nextPage.pageInfo.endCursor;
        pageCount++;
      }

      console.log(`Total comments fetched: ${allComments.length} (${pageCount} pages)`);

      for (const comment of allComments) {
        const matchedTags = getMatchingTags(comment.body || "");

        if (matchedTags.length > 0) {
          const issue = await comment.issue;

          if (issue) {
            // Fetch user and state information
            const user = await comment.user;
            const state = await issue.state;
            const assignee = await issue.assignee;

            filteredComments.push({
              comment: {
                ...comment,
                _user: user,
              },
              issue: {
                ...issue,
                _state: state,
                _assignee: assignee,
              },
              matchedTags,
            });
          }
        }
      }

      console.log(`Found ${filteredComments.length} comments with monitored tags`);
      return filteredComments;
    }
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    throw error;
  }
}

/**
 * Validate Linear API connection
 */
export async function validateLinearConnection(): Promise<boolean> {
  try {
    const client = getLinearClient();
    const viewer = await client.viewer;
    console.log(`Connected to Linear as: ${viewer.name} (${viewer.email})`);
    return true;
  } catch (error) {
    console.error("Failed to connect to Linear:", error);
    return false;
  }
}
