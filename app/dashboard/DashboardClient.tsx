"use client";

import { useState } from "react";
import { deleteAccount, updateDisplayName, updatePreferences } from "./actions";

export function PreferencesForm({
  initial,
}: {
  initial: { newsletter: boolean; notify_new_posts: boolean };
}) {
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);

  const toggle = async (key: "newsletter" | "notify_new_posts") => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await updatePreferences(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={prefs.newsletter}
          onChange={() => toggle("newsletter")}
          className="mt-1 h-4 w-4 accent-ink"
        />
        <span>
          <span className="block font-semibold">Weekly money tips</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">
            One practical money email a week. You can unsubscribe from any email we send.
          </span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={prefs.notify_new_posts}
          onChange={() => toggle("notify_new_posts")}
          className="mt-1 h-4 w-4 accent-ink"
        />
        <span>
          <span className="block font-semibold">New post notifications</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">
            Tell me when a new guide is published. Used for account notifications when they arrive.
          </span>
        </span>
      </label>
      {saved && <p className="text-sm font-medium">Preferences saved.</p>}
    </div>
  );
}

export function DisplayNameForm({ initialName }: { initialName: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <form
      action={async (formData: FormData) => {
        await updateDisplayName(formData);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="display-name" className="label">
          Display name
        </label>
        <input
          id="display-name"
          name="display_name"
          type="text"
          defaultValue={initialName}
          maxLength={80}
          className="field"
          placeholder="e.g. Adaeze O."
        />
      </div>
      <button type="submit" className="btn btn-ghost !py-2.5 text-sm">
        Save name
      </button>
      {saved && <p className="text-sm font-medium">Name saved.</p>}
    </form>
  );
}

export function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-ghost !py-2.5 text-sm"
      >
        Delete my account
      </button>
    );
  }
  return (
    <div className="border border-ink bg-card p-4">
      <p className="text-sm leading-relaxed">
        This permanently deletes your saved guides, reading history, calculator results,
        preferences and profile, and signs you out.
      </p>
      <form action={deleteAccount} className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary !py-2.5 text-sm">
          Yes, delete my data
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="btn btn-ghost !py-2.5 text-sm"
        >
          Cancel
        </button>
      </form>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Deleting the sign-in account itself needs a server-side step that is not part of this
        release — ask us through the contact page and we will confirm once it is done.
      </p>
    </div>
  );
}
