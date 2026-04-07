/**
 * Typed REST client for the FastAPI LMS backend.
 * Base URL: NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:8000)
 */

export const AUTH_TOKEN_KEY = "lms_access_token";
let inMemoryAuthToken: string | null = null;

/**
 * Public API origin for display in errors (e.g. “check server at …”).
 */
function serverBackendOrigin(): string {
  const fromEnv =
    process.env.BACKEND_URL?.trim().replace(/\/$/, "") ||
    process.env.BACKEND_INTERNAL_URL?.trim().replace(/\/$/, "");
  return fromEnv || "http://127.0.0.1:8000";
}

export function getApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (explicit) return explicit;
  if (typeof window !== "undefined") return window.location.origin;
  return serverBackendOrigin();
}

/**
 * Resolved `/api/v1` URL for JSON calls.
 * - If `NEXT_PUBLIC_API_URL` is set → `{origin}/api/v1` (browser must pass CORS on the API).
 * - Otherwise in the browser → same-origin `/api/lms` (rewritten by Next to FastAPI — avoids CORS).
 * - On the server → `BACKEND_INTERNAL_URL` or `http://127.0.0.1:8000`.
 */
function getApiV1Url(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (explicit) {
    return `${explicit}/api/v1`;
  }
  if (typeof window !== "undefined") {
    return "/api/lms";
  }
  return `${serverBackendOrigin()}/api/v1`;
}

export type UserRole = "student" | "admin";

export type UserPublic = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type CourseOut = {
  id: string;
  title: string;
  description: string | null;
  is_free: boolean;
  /** Decimal string from API when paid */
  price: string | null;
  youtube_url: string | null;
  image_url: string | null;
  instructor_id: string;
  created_at: string;
  updated_at: string;
  lesson_count: number;
};

export type LessonOut = {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
  created_at: string;
};

export type ModuleOut = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
  lessons: LessonOut[];
};

export type CourseDetail = CourseOut & {
  modules: ModuleOut[];
};

export type EnrollmentOut = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
};

export type ProgressOut = {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percent: number;
  completed_at: string | null;
  updated_at: string;
};

export type TaskOut = {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type SubmissionStatus = "pending" | "reviewed" | "rejected";

export type SubmissionOut = {
  id: string;
  task_id: string;
  user_id: string;
  file_url: string | null;
  link_url: string | null;
  submitted_at: string;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

export type TicketStatus = "open" | "closed";

export type TicketOut = {
  id: string;
  user_id: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  closed_at: string | null;
  /** Only populated for admin list */
  student_email?: string | null;
  student_full_name?: string | null;
};

export type MessageOut = {
  id: string;
  ticket_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type TicketDetail = TicketOut & {
  messages: MessageOut[];
};

export type TimeSlotOut = {
  id: string;
  start_at: string;
  end_at: string;
  capacity: number;
  created_by: string | null;
  created_at: string;
};

export type BookingOut = {
  id: string;
  user_id: string;
  time_slot_id: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export type JobOut = {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  created_by: string | null;
  closes_at: string | null;
  created_at: string;
};

export type ApplicationStatus = "pending" | "reviewed" | "rejected" | "hired";

export type ApplicationOut = {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  applied_at: string;
};

/** Default timeout so UI never hangs forever when the API is down or the proxy stalls. */
export const DEFAULT_API_TIMEOUT_MS = 25_000;

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Avoid `instanceof ApiError` in code that may live in chunks where the class isn’t bound (Turbopack). */
function isApiErrorShape(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "detail" in err &&
    typeof (err as { detail: unknown }).detail === "string" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) inMemoryAuthToken = token;
    return token;
  } catch {
    return inMemoryAuthToken;
  }
}

export function setAuthToken(token: string | null): void {
  inMemoryAuthToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    else window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore storage failures (private mode / browser policy). In-memory token still works.
  }
  window.dispatchEvent(new CustomEvent("lms-auth-token", { detail: token }));
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken ?? getStoredToken();
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function formatValidationDetail(item: unknown): string {
  if (item && typeof item === "object" && "msg" in item && typeof (item as { msg: unknown }).msg === "string") {
    return (item as { msg: string }).msg;
  }
  return JSON.stringify(item);
}

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => formatValidationDetail(d)).join(" · ");
    }
    if (data.detail && typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

/**
 * Human-readable message for any thrown error (network, ApiError, etc.).
 */
export function formatClientError(err: unknown): string {
  if (isApiErrorShape(err)) return err.detail;
  if (err instanceof Error) {
    if (err.name === "AbortError" || /aborted|timed out/i.test(err.message)) {
      return `Request timed out after ${DEFAULT_API_TIMEOUT_MS / 1000}s. Start the FastAPI backend and set BACKEND_URL in .env.local to match it (same origin uses /api/lms → ${getApiV1Url()}).`;
    }
  }
  if (err instanceof TypeError && typeof err.message === "string") {
    if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
      return `Cannot reach the API. Start the backend (e.g. uvicorn) and ensure BACKEND_URL in .env.local matches it, or set NEXT_PUBLIC_API_URL. Target: ${getApiV1Url()}`;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

function mergeAbortSignals(a: AbortSignal, b: AbortSignal | null | undefined): AbortSignal {
  if (!b) return a;
  if (typeof AbortSignal !== "undefined" && "any" in AbortSignal && typeof AbortSignal.any === "function") {
    return AbortSignal.any([a, b]);
  }
  return a;
}

function createTimeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

/**
 * Low-level JSON request with optional Bearer token.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null; json?: Json } = {},
): Promise<T> {
  const { token = getAuthToken(), json, headers: initHeaders, signal: userSignal, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    rest.body = JSON.stringify(json);
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = `${getApiV1Url()}${path}`;
  const timeoutSignal = createTimeoutSignal(DEFAULT_API_TIMEOUT_MS);
  const signal = mergeAbortSignals(timeoutSignal, userSignal ?? undefined);

  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers, credentials: "omit", signal });
  } catch (err) {
    const hint =
      typeof window !== "undefined" && url.startsWith("/")
        ? " If the dev server was restarted, try again."
        : "";
    throw new ApiError(
      0,
      `${formatClientError(err)}${hint}`,
    );
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const detail = await parseErrorDetail(res);
    if (res.status === 401) {
      setAuthToken(null);
    }
    throw new ApiError(res.status, detail);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function register(body: {
  email: string;
  password: string;
  full_name: string;
}): Promise<UserPublic> {
  return apiRequest<UserPublic>("/auth/register", {
    method: "POST",
    json: body as unknown as Json,
    token: null,
  });
}

export async function login(body: { email: string; password: string }): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    json: body as unknown as Json,
    token: null,
  });
}

export async function getMe(token?: string | null): Promise<UserPublic> {
  return apiRequest<UserPublic>("/auth/me", { method: "GET", token });
}

export async function getCourses(): Promise<CourseOut[]> {
  return apiRequest<CourseOut[]>("/courses", { method: "GET" });
}

export async function getCourse(courseId: string): Promise<CourseDetail> {
  return apiRequest<CourseDetail>(`/courses/${courseId}`, { method: "GET" });
}

export async function getMyCourses(): Promise<CourseOut[]> {
  return apiRequest<CourseOut[]>("/courses/mine", { method: "GET" });
}

export async function enrollCourse(courseId: string): Promise<EnrollmentOut> {
  return apiRequest<EnrollmentOut>(`/courses/${courseId}/enroll`, { method: "POST" });
}

export async function getMyCourseProgress(courseId: string): Promise<ProgressOut[]> {
  return apiRequest<ProgressOut[]>(`/courses/${courseId}/my-progress`, { method: "GET" });
}

export async function upsertLessonProgress(
  lessonId: string,
  body: { progress_percent: number; mark_complete?: boolean },
): Promise<ProgressOut> {
  return apiRequest<ProgressOut>(`/lessons/${lessonId}/progress`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function getTasks(params?: { course_id?: string; lesson_id?: string }): Promise<TaskOut[]> {
  const sp = new URLSearchParams();
  if (params?.course_id) sp.set("course_id", params.course_id);
  if (params?.lesson_id) sp.set("lesson_id", params.lesson_id);
  const q = sp.toString();
  return apiRequest<TaskOut[]>(`/tasks${q ? `?${q}` : ""}`, { method: "GET" });
}

export async function getMySubmissions(): Promise<SubmissionOut[]> {
  return apiRequest<SubmissionOut[]>("/users/me/submissions", { method: "GET" });
}

export async function submitTask(
  taskId: string,
  body: { file_url?: string | null; link_url?: string | null },
): Promise<SubmissionOut> {
  return apiRequest<SubmissionOut>(`/tasks/${taskId}/submit`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function createTicket(body: {
  subject: string;
  initial_message: string;
}): Promise<TicketDetail> {
  return apiRequest<TicketDetail>("/tickets", { method: "POST", json: body as unknown as Json });
}

export async function listTickets(status?: TicketStatus): Promise<TicketOut[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<TicketOut[]>(`/tickets${q}`, { method: "GET" });
}

/** Alias for admin support inbox — same as `listTickets` (admin sees all tickets). */
export const getAllTickets = listTickets;

export async function getTicket(ticketId: string): Promise<TicketDetail> {
  return apiRequest<TicketDetail>(`/tickets/${ticketId}`, { method: "GET" });
}

export async function sendMessage(ticketId: string, body: { body: string }): Promise<MessageOut> {
  return apiRequest<MessageOut>(`/tickets/${ticketId}/messages`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function getTimeSlots(): Promise<TimeSlotOut[]> {
  return apiRequest<TimeSlotOut[]>("/time-slots", { method: "GET" });
}

export async function listBookings(): Promise<BookingOut[]> {
  return apiRequest<BookingOut[]>("/bookings", { method: "GET" });
}

export async function bookAppointment(body: {
  time_slot_id: string;
  notes?: string | null;
}): Promise<BookingOut> {
  return apiRequest<BookingOut>("/bookings", { method: "POST", json: body as unknown as Json });
}

export async function getJobs(): Promise<JobOut[]> {
  return apiRequest<JobOut[]>("/jobs", { method: "GET" });
}

export async function applyJob(
  jobId: string,
  body: { cover_letter?: string | null; resume_url?: string | null },
): Promise<ApplicationOut> {
  return apiRequest<ApplicationOut>(`/jobs/${jobId}/apply`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function getMyApplications(): Promise<ApplicationOut[]> {
  return apiRequest<ApplicationOut[]>("/users/me/applications", { method: "GET" });
}

export async function updateProfile(body: { full_name?: string }): Promise<UserPublic> {
  return apiRequest<UserPublic>("/users/me", { method: "PATCH", json: body as Json });
}

export async function closeTicket(ticketId: string): Promise<TicketOut> {
  return apiRequest<TicketOut>(`/tickets/${ticketId}/close`, { method: "POST" });
}

/** Admin: create a bookable mentor time slot. */
export async function createTimeSlot(body: {
  start_at: string;
  end_at: string;
  capacity: number;
}): Promise<TimeSlotOut> {
  return apiRequest<TimeSlotOut>("/time-slots", { method: "POST", json: body as Json });
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export type AdminStats = {
  total_users: number;
  total_courses: number;
  active_enrollments: number;
  tasks_submitted: number;
  open_doubts: number;
  booked_appointments: number;
};

export type TimeSeriesPoint = { date: string; value: number };

export type AdminCharts = {
  user_signups: TimeSeriesPoint[];
  enrollments: TimeSeriesPoint[];
  task_submissions: TimeSeriesPoint[];
};

export type AdminActivityItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  created_at: string;
};

export type SubmissionWithUser = {
  id: string;
  task_id: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  file_url: string | null;
  link_url: string | null;
  submitted_at: string;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

export async function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/admin/stats", { method: "GET" });
}

export async function getAdminCharts(): Promise<AdminCharts> {
  return apiRequest<AdminCharts>("/admin/charts", { method: "GET" });
}

export async function getAdminActivity(): Promise<{ items: AdminActivityItem[] }> {
  return apiRequest<{ items: AdminActivityItem[] }>("/admin/activity", { method: "GET" });
}

export async function listUsers(): Promise<UserPublic[]> {
  return apiRequest<UserPublic[]>("/users", { method: "GET" });
}

export async function updateUserAdmin(
  userId: string,
  body: { role?: UserRole; is_active?: boolean },
): Promise<UserPublic> {
  return apiRequest<UserPublic>(`/users/${userId}`, { method: "PATCH", json: body as Json });
}

export async function createCourseAdmin(body: {
  title: string;
  description?: string | null;
  youtube_url: string;
  is_free: boolean;
  price?: string | number | null;
  image_url?: string | null;
}): Promise<CourseOut> {
  return apiRequest<CourseOut>("/courses", { method: "POST", json: body as Json });
}

export async function updateCourseAdmin(
  courseId: string,
  body: {
    title?: string;
    description?: string | null;
    is_free?: boolean;
    price?: string | number | null;
    youtube_url?: string | null;
    image_url?: string | null;
  },
): Promise<CourseOut> {
  return apiRequest<CourseOut>(`/courses/${courseId}`, { method: "PATCH", json: body as Json });
}

export async function uploadCourseCover(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const token = getStoredToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = `${getApiV1Url()}/uploads/course-cover`;
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", body: form, headers, credentials: "omit" });
  } catch (err) {
    throw new ApiError(0, formatClientError(err));
  }
  if (!res.ok) {
    const detail = await parseErrorDetail(res);
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as { url: string };
}

export async function deleteCourseAdmin(courseId: string): Promise<void> {
  return apiRequest<void>(`/courses/${courseId}`, { method: "DELETE" });
}

export async function addCourseModule(
  courseId: string,
  body: { title: string; order_index?: number },
): Promise<ModuleOut> {
  return apiRequest<ModuleOut>(`/courses/${courseId}/modules`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function addModuleLesson(
  moduleId: string,
  body: {
    title: string;
    content?: string | null;
    order_index?: number;
    duration_minutes?: number | null;
  },
): Promise<LessonOut> {
  return apiRequest<LessonOut>(`/courses/modules/${moduleId}/lessons`, {
    method: "POST",
    json: body as unknown as Json,
  });
}

export async function createTaskAdmin(body: {
  title: string;
  description?: string | null;
  course_id?: string | null;
  lesson_id?: string | null;
  due_at?: string | null;
}): Promise<TaskOut> {
  return apiRequest<TaskOut>("/tasks", { method: "POST", json: body as unknown as Json });
}

export async function listAllSubmissions(): Promise<SubmissionWithUser[]> {
  return apiRequest<SubmissionWithUser[]>("/tasks/submissions", { method: "GET" });
}

export async function reviewSubmissionAdmin(
  submissionId: string,
  body: {
    score?: number | null;
    feedback?: string | null;
    status: SubmissionStatus;
  },
): Promise<SubmissionOut> {
  return apiRequest<SubmissionOut>(`/tasks/submissions/${submissionId}/review`, {
    method: "PATCH",
    json: body as Json,
  });
}

export async function createJobAdmin(body: {
  title: string;
  description?: string | null;
  company?: string | null;
  location?: string | null;
  closes_at?: string | null;
}): Promise<JobOut> {
  return apiRequest<JobOut>("/jobs", { method: "POST", json: body as Json });
}

export async function updateJobAdmin(
  jobId: string,
  body: {
    title?: string;
    description?: string | null;
    company?: string | null;
    location?: string | null;
    closes_at?: string | null;
  },
): Promise<JobOut> {
  return apiRequest<JobOut>(`/jobs/${jobId}`, { method: "PATCH", json: body as Json });
}

export async function deleteJobAdmin(jobId: string): Promise<void> {
  return apiRequest<void>(`/jobs/${jobId}`, { method: "DELETE" });
}
