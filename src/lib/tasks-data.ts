export type TaskStatus = "pending" | "submitted" | "reviewed";

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  /** Display-ready deadline label */
  deadline: string;
  status: TaskStatus;
};

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Portfolio milestone: analytics case study",
    description:
      "Submit a written case study with data sources, methodology, and recommendations. Include charts exported from your notebook.",
    deadline: "Apr 12, 2026 · 11:59 PM",
    status: "pending",
  },
  {
    id: "t2",
    title: "ML pipeline checkpoint",
    description:
      "Upload your feature pipeline code and a short README describing how you handle missing values and leakage.",
    deadline: "Apr 18, 2026 · 11:59 PM",
    status: "pending",
  },
  {
    id: "t3",
    title: "Peer review: storytelling deck",
    description:
      "Share a link to your slide deck and add notes on the audience and key metrics you emphasized.",
    deadline: "Apr 8, 2026 · 11:59 PM",
    status: "submitted",
  },
  {
    id: "t4",
    title: "Capstone demo recording",
    description:
      "Submit a 5–8 minute screen recording walking through your final project dashboard.",
    deadline: "Mar 28, 2026 · 11:59 PM",
    status: "reviewed",
  },
];
