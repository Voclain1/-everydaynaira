"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/topics";

const TOPIC_CATEGORIES = new Set<string>(TOPICS.map((t) => t.category));

export async function updatePreferences(prefs: {
  newsletter: boolean;
  notify_new_posts: boolean;
  interests: string[];
}) {
  const supabase = await getSupabaseServer();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const interests = (prefs.interests ?? []).filter((c) => TOPIC_CATEGORIES.has(c));
  await supabase.from("preferences").upsert(
    {
      user_id: user.id,
      newsletter: prefs.newsletter,
      notify_new_posts: prefs.notify_new_posts,
      interests,
    },
    { onConflict: "user_id" },
  );
  revalidatePath("/dashboard/");
}

export async function updateDisplayName(formData: FormData) {
  const supabase = await getSupabaseServer();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const name = String(formData.get("display_name") ?? "")
    .trim()
    .slice(0, 80);
  await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: name || null }, { onConflict: "id" });
  await supabase.auth.updateUser({ data: { display_name: name || undefined } });
  revalidatePath("/dashboard/");
}

/**
 * Deletes the reader's whole account: the Sprint 7 migration's
 * delete_current_user() function removes every stored row AND the
 * auth.users sign-in record in one step. If that function is missing
 * (the migration has not been run yet), fall back to removing the data
 * rows directly, as Sprint 6 did.
 */
export async function deleteAccount() {
  const supabase = await getSupabaseServer();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in/");
  const { error } = await supabase.rpc("delete_current_user");
  if (error) {
    const tables: { name: string; key: string }[] = [
      { name: "push_subscriptions", key: "user_id" },
      { name: "calculator_snapshots", key: "user_id" },
      { name: "reading_history", key: "user_id" },
      { name: "saved_guides", key: "user_id" },
      { name: "preferences", key: "user_id" },
      { name: "profiles", key: "id" },
    ];
    for (const table of tables) {
      await supabase.from(table.name).delete().eq(table.key, user.id);
    }
  }
  await supabase.auth.signOut();
  redirect("/sign-in/?deleted=1");
}
