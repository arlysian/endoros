"use client";

import { useState, useEffect } from "react";

interface Rate {
  id: string;
  platform: string;
  contentType: string;
  price: number;
  currency: string;
}

const platforms = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "TWITTER", label: "X / Twitter" },
  { value: "YOUTUBE", label: "YouTube" },
];

const contentTypeSuggestions: Record<string, string[]> = {
  INSTAGRAM: ["Post", "Story", "Reel", "Carousel", "Live"],
  TIKTOK: ["Video", "Live", "Duet"],
  TWITTER: ["Post", "Thread", "Space"],
  YOUTUBE: ["Video", "Short", "Live", "Integration"],
};

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("creator_rates");
      if (cached) {
        try { return JSON.parse(cached); } catch { /* ignore */ }
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("creator_rates")) return false;
    return true;
  });
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newRate, setNewRate] = useState({
    platform: "INSTAGRAM",
    contentType: "",
    price: "",
    currency: "USD",
  });

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    localStorage.setItem("creator_rates", JSON.stringify(rates));
  }, [rates]);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/rates");
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch (error) {
      console.error("Failed to fetch rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRate = async () => {
    if (!newRate.contentType || !newRate.price) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: newRate.platform,
          contentType: newRate.contentType,
          price: parseFloat(newRate.price),
          currency: newRate.currency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRates([...rates, data]);
        setNewRate({ platform: "INSTAGRAM", contentType: "", price: "", currency: "USD" });
        setShowModal(false);
      } else {
        alert("Failed to add rate");
      }
    } catch (error) {
      console.error("Error adding rate:", error);
      alert("Failed to add rate");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRate = async (id: string) => {
    try {
      const res = await fetch(`/api/rates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRates(rates.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete rate");
      }
    } catch (error) {
      console.error("Error deleting rate:", error);
      alert("Failed to delete rate");
    }
    setDeleteConfirm(null);
  };

  const formatCurrency = (price: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  const platformLabel = (value: string) =>
    platforms.find((p) => p.value === value)?.label || value;

  // Group rates by platform
  const grouped = rates.reduce<Record<string, Rate[]>>((acc, rate) => {
    (acc[rate.platform] ??= []).push(rate);
    return acc;
  }, {});

  const suggestions = contentTypeSuggestions[newRate.platform] || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Rates</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Set your pricing per platform and content type
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Rate
        </button>
      </div>

      {/* Rates List */}
      {loading ? (
        <div className="text-sm text-neutral-400">Loading...</div>
      ) : rates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-500 mb-1">No rates yet</p>
          <p className="text-xs text-neutral-400">
            Add your first rate to show pricing on your media kit
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([platform, items]) => (
            <section key={platform}>
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">
                {platformLabel(platform)}
              </h2>
              <div className="space-y-2">
                {items.map((rate) => (
                  <div
                    key={rate.id}
                    className="border border-neutral-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-black">{rate.contentType}</p>
                      <p className="text-sm text-neutral-400 mt-0.5">
                        {platformLabel(rate.platform)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-black">
                        {formatCurrency(rate.price, rate.currency)}
                      </span>
                      <button
                        onClick={() => setDeleteConfirm(rate.id)}
                        className="text-neutral-400 hover:text-black transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add Rate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">Add Rate</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Platform *
                </label>
                <select
                  value={newRate.platform}
                  onChange={(e) =>
                    setNewRate({ ...newRate, platform: e.target.value, contentType: "" })
                  }
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black appearance-none cursor-pointer"
                >
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Content Type *
                </label>
                <input
                  type="text"
                  value={newRate.contentType}
                  onChange={(e) =>
                    setNewRate({ ...newRate, contentType: e.target.value })
                  }
                  maxLength={50}
                  placeholder="e.g. Post, Story, Reel"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                />
                {suggestions.length > 0 && !newRate.contentType && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRate({ ...newRate, contentType: s })}
                        className="px-2.5 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newRate.price}
                    onChange={(e) => setNewRate({ ...newRate, price: e.target.value })}
                    placeholder="500"
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Currency
                  </label>
                  <select
                    value={newRate.currency}
                    onChange={(e) =>
                      setNewRate({ ...newRate, currency: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg text-black focus:outline-none focus:ring-2 ring-black appearance-none cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-black hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRate}
                disabled={!newRate.contentType || !newRate.price || submitting}
                className="flex-1 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-default"
              >
                {submitting ? "Adding..." : "Add Rate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-black mb-2">Are you sure?</h2>
            <p className="text-sm text-neutral-400 mb-6">
              This rate will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-black hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRate(deleteConfirm)}
                className="flex-1 px-6 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
