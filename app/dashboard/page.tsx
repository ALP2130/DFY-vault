import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string; canceled?: string };
}) {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <DashboardClient
      profile={profile}
      upgraded={searchParams.upgraded === "1"}
      canceled={searchParams.canceled === "1"}
    />
  );
}
