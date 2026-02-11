"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [isMediaKitPublic, setIsMediaKitPublic] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setIsMediaKitPublic(data.isMediaKitPublic ?? true);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchUserSettings();
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        console.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-black">Delete Account</h3>
            <p className="text-sm text-neutral-500 mt-2">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
