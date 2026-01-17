"use client";

import { useState, useEffect } from "react";

export default function Settings() {
  const [audienceSummary, setAudienceSummary] = useState("");
  const [isSavingAudience, setIsSavingAudience] = useState(false);
  const [isMediaKitPublic, setIsMediaKitPublic] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setIsMediaKitPublic(data.isMediaKitPublic ?? true);
          setAudienceSummary(data.audienceSummary ?? "");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchUserSettings();
  }, []);

  const handleSaveAudienceSummary = async () => {
    setIsSavingAudience(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceSummary }),
      });

      if (!res.ok) {
        console.error("Failed to save audience summary");
      }
    } catch (error) {
      console.error("Error saving audience summary:", error);
    } finally {
      setIsSavingAudience(false);
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setIsToggleLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMediaKitPublic: checked }),
      });

      if (res.ok) {
        setIsMediaKitPublic(checked);
      } else {
        console.error("Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating setting:", error);
    } finally {
      setIsToggleLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-10">
        {/* Audience Summary */}
        <section>
          <h2 className="text-sm font-medium text-black mb-4">Audience Summary</h2>
          <div className="mb-4">
            <label className="block text-xs text-neutral-400 mb-2">
              Describe your average audience
            </label>
            <textarea
              value={audienceSummary}
              onChange={(e) => setAudienceSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 rounded-lg text-black text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g., Young professionals aged 25-34, interested in tech and lifestyle..."
            />
          </div>
          <button
            onClick={handleSaveAudienceSummary}
            disabled={isSavingAudience}
            className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSavingAudience ? "Saving..." : "Save"}
          </button>
        </section>

        {/* Privacy Settings */}
        <section>
          <h2 className="text-sm font-medium text-black mb-4">Privacy</h2>
          <div className="flex items-center justify-between py-4 border-b border-neutral-100">
            <div>
              <p className="text-sm text-black">Public Media Kit</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Allow anyone to view your media kit
              </p>
            </div>
            <Toggle
              checked={isMediaKitPublic}
              onChange={handleToggleChange}
              disabled={isToggleLoading}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-medium text-black mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between py-4 border-b border-neutral-100">
            <div>
              <p className="text-sm text-black">Delete Account</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              Delete
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${checked ? "bg-black" : "bg-neutral-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
          ${checked ? "translate-x-[18px]" : "translate-x-1"}
        `}
      />
    </button>
  );
}
