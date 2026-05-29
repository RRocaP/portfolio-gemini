import { redirect } from "next/navigation";

// Root path has no content of its own — send visitors to the default locale.
// (Replaces the GitHub-Pages <meta http-equiv="refresh"> hack with a real redirect.)
export default function RootPage() {
  redirect("/en/");
}
