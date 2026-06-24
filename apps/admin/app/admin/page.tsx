import { redirect } from "next/navigation";
import { adminPath } from "@/lib/paths";

export default function AdminHome() {
  redirect(adminPath("/dashboard"));
}
