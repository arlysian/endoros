"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
          onboardingCompleted: true,
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 h-16 relative z-10">
        <Link href="/" className="text-base font-semibold text-black tracking-tight">
          endoros
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 -mt-16">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-black mb-2">
              Let's create your profile
            </h1>
            <p className="text-neutral-500">
              Tell us a bit about yourself to get started
            </p>
          </div>

        {/* Form Card */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">@</span>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleUserNameChange(e.target.value)}
                    placeholder="yourname"
                    className={`w-full pl-8 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 ${userNameError ? "ring-2 ring-red-500/20" : ""}`}
                  />
                </div>
                {checkingUserName && (
                  <p className="text-sm text-neutral-500 mt-1">Checking availability...</p>
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
                <label className="block text-sm font-medium text-black mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Los Angeles, CA"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-neutral-200 appearance-none cursor-pointer"
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
              className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating profile..." : "Continue"}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            You can always update these later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
