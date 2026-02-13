/**
 * Serialize Linear SDK objects into plain JavaScript objects
 * that can be passed to Client Components
 */

// Helper to safely extract plain values from objects
function toPlainValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(toPlainValue);
  }
  if (typeof value === 'object') {
    // For objects, only extract plain properties (no functions, no _private fields)
    const plain: any = {};
    for (const key in value) {
      if (key.startsWith('_')) continue; // Skip private fields
      if (typeof value[key] === 'function') continue; // Skip functions
      if (value[key] === null || value[key] === undefined) continue; // Skip null/undefined

      const propValue = value[key];
      if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') {
        plain[key] = propValue;
      } else if (propValue instanceof Date) {
        plain[key] = propValue.toISOString();
      }
    }
    return plain;
  }
  return undefined;
}

export function serializeTicket(ticket: any) {
  return {
    comment: {
      id: ticket.comment.id,
      body: ticket.comment.body || '',
      createdAt: ticket.comment.createdAt instanceof Date
        ? ticket.comment.createdAt.toISOString()
        : new Date(ticket.comment.createdAt || Date.now()).toISOString(),
      updatedAt: ticket.comment.updatedAt instanceof Date
        ? ticket.comment.updatedAt.toISOString()
        : new Date(ticket.comment.updatedAt || Date.now()).toISOString(),
    },
    issue: {
      id: ticket.issue.id,
      identifier: ticket.issue.identifier || '',
      title: ticket.issue.title || 'Untitled',
      description: ticket.issue.description || '',
      url: ticket.issue.url || '',
      priority: ticket.issue.priority || 0,
      createdAt: ticket.issue.createdAt instanceof Date
        ? ticket.issue.createdAt.toISOString()
        : new Date(ticket.issue.createdAt || Date.now()).toISOString(),
      updatedAt: ticket.issue.updatedAt instanceof Date
        ? ticket.issue.updatedAt.toISOString()
        : new Date(ticket.issue.updatedAt || Date.now()).toISOString(),
    },
    matchedTags: ticket.matchedTags || [],
  };
}

export function serializeTickets(tickets: any[]) {
  return tickets.map(serializeTicket);
}
