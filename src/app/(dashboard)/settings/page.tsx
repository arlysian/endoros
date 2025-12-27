"use client";

import { useState, useEffect } from "react";

export default function Settings() {
  // Audience Summary
  const [audienceSummary, setAudienceSummary] = useState("");
  const [isSavingAudience, setIsSavingAudience] = useState(false);

  // Privacy Settings
  const [isMediaKitPublic, setIsMediaKitPublic] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

  // Fetch initial values on mount
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

  // Handle audience summary save
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

  // Handle toggle change
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
    <div className="p-8">
      <div className="space-y-6">
        {/* Audience Summary */}
        <section className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-semibold text-foreground mb-6">Audience Summary</h2>

          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">
              Describe Your Average Audience
            </label>
            <textarea
              value={audienceSummary}
              onChange={(e) => setAudienceSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAudienceSummary}
              disabled={isSavingAudience}
              className="px-8 py-2.5 bg-[#768cff] text-white rounded-xl font-medium hover:bg-[#5a70e6] transition-colors disabled:opacity-50"
            >
              {isSavingAudience ? "Saving..." : "Save"}
            </button>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-semibold text-foreground mb-6">Privacy Settings</h2>

          {/* Public Media Kit Toggle */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Public Media Kit</h3>
                <p className="text-sm text-muted mt-1">
                  Allow anyone to view your media kit with your custom URL
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Private</span>
                <Toggle
                  checked={isMediaKitPublic}
                  onChange={handleToggleChange}
                  disabled={isToggleLoading}
                />
                <span className="text-sm text-muted">Public</span>
              </div>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-semibold text-foreground mb-6">Account Actions</h2>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-500">Delete Account</h3>
              <p className="text-sm text-muted mt-1">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Toggle Component
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
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? "bg-[#768cff]" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}
