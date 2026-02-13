// Linear webhook payload types
export interface LinearWebhookPayload {
  action: "create" | "update" | "remove";
  type: string;
  data: LinearComment | LinearIssue | any;
  createdAt: string;
  url: string;
  organizationId: string;
  webhookId: string;
  webhookTimestamp: number;
}

export interface LinearComment {
  id: string;
  body: string;
  issueId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: LinearUser;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: LinearState;
  assignee?: LinearUser;
  priority: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearState {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface LinearUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

// Dashboard display types
export interface FilteredTicket {
  issue: LinearIssue;
  comments: CommentWithTags[];
}

export interface CommentWithTags {
  comment: LinearComment;
  matchedTags: string[];
}

// Slack message types
export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: any;
  elements?: any[];
}

// Configuration types
export interface TagConfig {
  patterns: string[];
  caseSensitive: boolean;
}
