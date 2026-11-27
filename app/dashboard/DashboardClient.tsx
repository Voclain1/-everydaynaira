"use client";

import { useState } from "react";
import { deleteAccount, updateDisplayName, updatePreferences } from "./actions";
import { TOPICS } from "@/lib/topics";

export function PreferencesForm({
  initial,
}: {
  initial: { newsletter: boolean; notify_new_posts: boolean; interests: string[] };
}) {
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);

  const save = async (next: typeof prefs) => {
    setPrefs(next);
    await updatePreferences(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: "newsletter" | "notify_new_posts") =>
    void save({ ...prefs, [key]: !prefs[key] });

  const toggleInterest = (category: string) => {
    const interests = prefs.interests.includes(category)
      ? prefs.interests.filter((c) => c !== category)
      : [...prefs.interests, category];
    void save({ ...prefs, interests });
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
      <div>
        <p className="font-semibold">Topics you care about</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-2">
          Pick the topics you want recommendations from. Your dashboard and homepage will suggest
          guides from these topics and from what you have read recently.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const selected = prefs.interests.includes(topic.category);
            return (
              <button
                key={topic.category}
                type="button"
                onClick={() => toggleInterest(topic.category)}
                aria-pressed={selected}
                className={
                  selected
                    ? "btn btn-primary !py-2 !px-3 text-sm"
                    : "btn btn-ghost !py-2 !px-3 text-sm"
                }
              >
                {topic.name}
              </button>
            );
          })}
        </div>
      </div>
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
        This permanently deletes your whole account — saved guides, reading history, calculator
        results, preferences, profile and your sign-in record — and signs you out.
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
    </div>
  );
}
