import { redirect } from "next/navigation";

export default function JobUpdatesRedirectPage() {
  redirect("/dashboard/jobs");
}
