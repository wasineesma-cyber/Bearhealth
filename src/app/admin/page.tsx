import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminApp from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (!isAdmin()) redirect("/admin/login");
  return <AdminApp />;
}
