import { redirect } from "next/navigation";
import { ADMIN_BASE } from "@/lib/paths";

export default function Home() {
  redirect(ADMIN_BASE);
}
