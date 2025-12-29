"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userName: "",
    location: "",
    category: "",
  });

  const [saving, setSaving] = useState(false);
  const [userNameError, setUserNameError] = useState<string | null>(null);
  const [checkingUserName, setCheckingUserName] = useState(false);
  const userNameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    "Fashion & Style",
    "Beauty & Makeup",
    "Fitness & Health",
    "Travel & Adventure",
    "Food & Cooking",
    "Technology",
    "Gaming",
    "Entertainment",
    "Education",
    "Business & Finance",
  ];

  const checkUserNameAvailability = useCallback(async (userName: string) => {
    if (!userName) {
      setUserNameError(null);
      setCheckingUserName(false);
      return;
    }

    setCheckingUserName(true);
    try {
      const res = await fetch(`/api/user/check-username?userName=${encodeURIComponent(userName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.taken) {
          setUserNameError("This username is already taken");
        } else {
          setUserNameError(null);
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUserName(false);
    }
  }, []);

  const handleUserNameChange = (value: string) => {
    setFormData({ ...formData, userName: value });

    if (userNameCheckTimeout.current) {
      clearTimeout(userNameCheckTimeout.current);
    }

    userNameCheckTimeout.current = setTimeout(() => {
      checkUserNameAvailability(value);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!formData.userName || !formData.category) {
      return;
    }

    if (userNameError) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.userName,
          location: formData.location,
          category: formData.category,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = formData.userName && formData.category && !userNameError && !checkingUserName;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Let's create your profile
          </h1>
          <p className="text-muted">
            Tell us a bit about yourself to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => handleUserNameChange(e.target.value)}
                  placeholder="yourname"
                  className={`w-full pl-8 pr-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#768cff]/20 ${userNameError ? "ring-2 ring-red-500/20" : ""}`}
                />
              </div>
              {checkingUserName && (
                <p className="text-sm text-muted mt-1">Checking availability...</p>
              )}
              {userNameError && (
                <p className="text-sm text-red-500 mt-1">{userNameError}</p>
              )}
              {formData.userName && !checkingUserName && !userNameError && (
                <p className="text-sm text-green-600 mt-1">Username available</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Los Angeles, CA"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#768cff]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#768cff]/20 appearance-none cursor-pointer"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={saving || !isFormValid}
            className="w-full mt-6 px-6 py-3 bg-[#768cff] text-white rounded-lg font-medium hover:bg-[#5a70e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating profile..." : "Continue"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          You can always update these later in settings
        </p>
      </div>
    </div>
  );
}
