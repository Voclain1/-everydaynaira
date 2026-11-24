"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function updatePreferences(prefs: { newsletter: boolean; notify_new_posts: boolean }) {
  const supabase = await getSupabaseServer();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("preferences").upsert(
    { user_id: user.id, newsletter: prefs.newsletter, notify_new_posts: prefs.notify_new_posts },
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
 * Deletes all of the reader's stored rows — saved guides, reading
 * history, calculator snapshots, preferences and profile — then signs
 * them out. Deleting the auth.users row itself needs a server-side
 * service-role step and is NOT part of this sprint; the reader can ask
 * for it via the contact page (see the privacy policy).
 */
export async function deleteAccount() {
  const supabase = await getSupabaseServer();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in/");
  const tables: { name: string; key: string }[] = [
    { name: "calculator_snapshots", key: "user_id" },
    { name: "reading_history", key: "user_id" },
    { name: "saved_guides", key: "user_id" },
    { name: "preferences", key: "user_id" },
    { name: "profiles", key: "id" },
  ];
  for (const table of tables) {
    await supabase.from(table.name).delete().eq(table.key, user.id);
  }
  await supabase.auth.signOut();
  redirect("/sign-in/?deleted=1");
}
