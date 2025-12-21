"use client";

export default function AudienceInsights() {
  const genderData = [
    { label: "Female", value: 60, color: "#2596be" },
    { label: "Male", value: 36, color: "#2596be" },
    { label: "Others", value: 4, color: "#2596be" },
  ];

  const ageData = [
    { label: "18 - 24", value: 76 },
    { label: "25 - 34", value: 30 },
    { label: "35 - 44", value: 15 },
    { label: "45 and above", value: 5 },
  ];

  const countryData = [
    { country: "United States", value: 80 },
    { country: "Canada", value: 76 },
    { country: "United Kingdom", value: 54 },
    { country: "Australia", value: 30 },
    { country: "Germany", value: 14 },
  ];

  const postingTimes = [
    { day: "Monday", time: "2-4 PM", status: "Peak" as const },
    { day: "Tuesday", time: "1-3 PM", status: "Off-Peak" as const },
    { day: "Wednesday", time: "3-5 PM", status: "Peak" as const },
    { day: "Thursday", time: "12-2 PM", status: "Moderate" as const },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Audience Insights</h1>
        <p className="text-muted mt-1">Understand your audience demographics and engagement patterns.</p>
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-medium text-foreground mb-6">Gender Distribution</h2>
          <div className="space-y-5">
            {genderData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-medium text-foreground mb-6">Age Distribution</h2>
          <div className="space-y-5">
            {ageData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2596be] transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Summary */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">Audience Summary</h2>
        <p className="text-foreground">
          My audience is mostly women in the US, aged 16–20, in college, and interested in fashion
        </p>
      </div>

      {/* Top 5 Countries */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Top 5 Countries</h2>
        <div className="space-y-4">
          {countryData.map((item) => (
            <div key={item.country} className="flex items-center gap-4 p-4 border border-border rounded-xl">
              <span className="text-foreground w-40 flex-shrink-0">{item.country}</span>
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2596be] transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className="text-muted text-sm w-12 text-right">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Best Posting Times</h2>
        <div className="space-y-3">
          {postingTimes.map((item) => (
            <div
              key={item.day}
              className="flex items-center justify-between p-4 border border-border rounded-xl"
            >
              <div>
                <p className="font-medium text-foreground">{item.day}</p>
                <p className="text-sm text-muted">{item.time}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted mt-6">
          Note: Best posting times feature coming soon. Data will be based on your audience&apos;s activity patterns.
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Peak" | "Off-Peak" | "Moderate" }) {
  const bgColor = status === "Peak"
    ? "bg-emerald-600"
    : status === "Moderate"
      ? "bg-emerald-600"
      : "bg-gray-800";

  return (
    <span className={`px-4 py-1.5 ${bgColor} text-white text-sm font-medium rounded-full`}>
      {status}
    </span>
  );
}
