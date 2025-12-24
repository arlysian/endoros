"use client";

import { useState } from "react";

export default function Settings() {
  // Account Information
  const [email, setEmail] = useState("john_doe@gmail.com");
  const [location, setLocation] = useState("Los Angeles, CA");

  // Audience Summary
  const [audienceSummary, setAudienceSummary] = useState(
    "My audience is mostly women in the US, aged 16-20, in college, and interested in fashion."
  );

  // Privacy Settings
  const [isMediaKitPublic, setIsMediaKitPublic] = useState(true);
  const [customUrl, setCustomUrl] = useState("johndoe");
  const [isCustomUrlPublic, setIsCustomUrlPublic] = useState(false);

  // Security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="p-8">
      <div className="space-y-6">
        {/* Account Information */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Account Information</h2>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <p className="text-sm text-muted mt-2">
              This email is used for account login and important notifications
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm text-foreground mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-[#2596be] text-white rounded-xl font-medium hover:bg-[#1e7a9a] transition-colors">
              Save Email Changes
            </button>
          </div>
        </section>

        {/* Audience Summary */}
        <section className="bg-white rounded-xl border border-border p-6">
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
            <button className="px-8 py-2.5 bg-[#2596be] text-white rounded-xl font-medium hover:bg-[#1e7a9a] transition-colors">
              Save
            </button>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Privacy Settings</h2>

          {/* Public Media Kit Toggle */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Public Media Kit</h3>
                <p className="text-sm text-muted mt-1">
                  Allow anyone to view your media kit with your custom URL
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Private</span>
                <Toggle checked={isMediaKitPublic} onChange={setIsMediaKitPublic} />
                <span className="text-sm text-muted">Public</span>
              </div>
            </div>
          </div>

          {/* Custom URL */}
          <div>
            <h3 className="font-medium text-foreground mb-1">Custom URL</h3>
            <p className="text-sm text-muted mb-3">
              Allow anyone to view your media kit with your custom URL
            </p>

            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center">
                <span className="text-sm text-muted mr-2">endoros.com/</span>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-48 px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted whitespace-nowrap">Private (one time link)</span>
                <Toggle checked={isCustomUrlPublic} onChange={setIsCustomUrlPublic} />
                <span className="text-sm text-muted">Public</span>
              </div>
            </div>

            <p className="text-sm text-muted">
              This will be your public media kit URL that you can share with brands.
            </p>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Security</h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-foreground mb-2">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-foreground mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div></div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-[#2596be] text-white rounded-xl font-medium hover:bg-[#1e7a9a] transition-colors">
              Update Password
            </button>
          </div>
        </section>

        {/* Account Actions */}
        <section className="bg-white rounded-xl border border-border p-6">
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
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? "bg-[#2596be]" : "bg-gray-300"}
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
