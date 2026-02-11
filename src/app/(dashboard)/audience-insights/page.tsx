"use client";

import { useState, useEffect } from "react";

interface DemographicItem {
  type: string;
  label: string;
  value: number;
}

export default function AudienceInsights() {
  const [demographics, setDemographics] = useState<DemographicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemographics() {
      try {
        const res = await fetch("/api/demographics");
        if (res.ok) {
          const data = await res.json();
          setDemographics(data.demographics);
        }
      } catch (error) {
        console.error("Failed to fetch demographics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDemographics();
  }, []);

  const genderData = demographics.filter((d) => d.type === "gender");
  const ageData = demographics.filter((d) => d.type === "age");
  const countryData = demographics.filter((d) => d.type === "country");

  const genderTotal = genderData.reduce((sum, d) => sum + d.value, 0);
  const ageTotal = ageData.reduce((sum, d) => sum + d.value, 0);
  const maxCountryValue = countryData.length > 0 ? Math.max(...countryData.map((d) => d.value)) : 1;

  const genderLabels: Record<string, string> = { F: "Female", M: "Male", U: "Other" };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Understand your audience demographics</p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading demographics...</p>
      ) : demographics.length === 0 ? (
        <p className="text-sm text-neutral-400">No demographic data available yet. Connect an Instagram account with 100+ followers.</p>
      ) : (
        <>
          {/* Demographics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Gender */}
            <div>
              <h2 className="text-sm font-medium text-black mb-6">Gender</h2>
              <div className="space-y-4">
                {genderData.map((item) => {
                  const pct = genderTotal > 0 ? Math.round((item.value / genderTotal) * 100) : 0;
                  return (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-black w-16">{genderLabels[item.label] || item.label}</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-400 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Age */}
            <div>
              <h2 className="text-sm font-medium text-black mb-6">Age</h2>
              <div className="space-y-4">
                {ageData.map((item) => {
                  const pct = ageTotal > 0 ? Math.round((item.value / ageTotal) * 100) : 0;
                  return (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-black w-16">{item.label}</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-400 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Countries */}
          {countryData.length > 0 && (
            <div className="mb-12">
              <h2 className="text-sm font-medium text-black mb-6">Top Countries</h2>
              <div className="space-y-3">
                {countryData
                  .sort((a, b) => b.value - a.value)
                  .map((item, idx) => (
                    <div key={item.label} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
                      <span className="text-xs text-neutral-400 w-4">{idx + 1}</span>
                      <span className="text-sm text-black flex-1">{item.label}</span>
                      <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${(item.value / maxCountryValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-400 w-16 text-right">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
