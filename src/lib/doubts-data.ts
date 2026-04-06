export type TicketStatus = "open" | "closed";

export type MessageSender = "student" | "mentor";

export type DoubtMessage = {
  id: string;
  ticketId: string;
  body: string;
  sender: MessageSender;
  /** ISO timestamp */
  at: string;
};

export type DoubtTicket = {
  id: string;
  title: string;
  status: TicketStatus;
  messages: DoubtMessage[];
};

export function truncatePreview(text: string, max = 72): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function lastMessagePreview(messages: DoubtMessage[]): string {
  if (messages.length === 0) return "";
  return truncatePreview(messages[messages.length - 1].body);
}

export const initialDoubtTickets: DoubtTicket[] = [
  {
    id: "dk-1",
    title: "Confusion on feature scaling before model fit",
    status: "open",
    messages: [
      {
        id: "m1",
        ticketId: "dk-1",
        body:
          "Should we fit the scaler on the full training split only, or per-fold inside CV? The notebook mentions both.",
        sender: "student",
        at: "2026-04-05T10:22:00.000Z",
      },
      {
        id: "m2",
        ticketId: "dk-1",
        body:
          "Fit on training data only for each CV fold—never on validation rows within that fold. I’ll add a one-pager to the module resources.",
        sender: "mentor",
        at: "2026-04-05T14:05:00.000Z",
      },
      {
        id: "m3",
        ticketId: "dk-1",
        body: "Thanks — that clears it up. I’ll refactor my pipeline accordingly.",
        sender: "student",
        at: "2026-04-05T15:40:00.000Z",
      },
    ],
  },
  {
    id: "dk-2",
    title: "Agent tool-calling timeout in lab sandbox",
    status: "open",
    messages: [
      {
        id: "m4",
        ticketId: "dk-2",
        body:
          "My agent keeps timing out after 30s when calling the search tool. Is that a platform limit?",
        sender: "student",
        at: "2026-04-06T09:10:00.000Z",
      },
    ],
  },
  {
    id: "dk-3",
    title: "Clarification on capstone rubric — storytelling",
    status: "closed",
    messages: [
      {
        id: "m5",
        ticketId: "dk-3",
        body: "Does the rubric weight the executive summary more than appendix charts?",
        sender: "student",
        at: "2026-03-28T11:00:00.000Z",
      },
      {
        id: "m6",
        ticketId: "dk-3",
        body:
          "Summary and key metrics together carry most of the score; appendix is supporting detail. See the rubric PDF page 2.",
        sender: "mentor",
        at: "2026-03-28T16:20:00.000Z",
      },
    ],
  },
];
