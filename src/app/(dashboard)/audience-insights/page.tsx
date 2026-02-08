"use client";

export default function AudienceInsights() {
  const genderData = [
    { label: "Female", value: 60 },
    { label: "Male", value: 36 },
    { label: "Other", value: 4 },
  ];

  const ageData = [
    { label: "18-24", value: 76 },
    { label: "25-34", value: 30 },
    { label: "35-44", value: 15 },
    { label: "45+", value: 5 },
  ];

  const countryData = [
    { country: "United States", code: "US", value: 80 },
    { country: "Canada", code: "CA", value: 76 },
    { country: "United Kingdom", code: "UK", value: 54 },
    { country: "Australia", code: "AU", value: 30 },
    { country: "Germany", code: "DE", value: 14 },
  ];

  const postingTimes = [
    { day: "Mon", time: "2-4 PM", engagement: 92 },
    { day: "Tue", time: "1-3 PM", engagement: 67 },
    { day: "Wed", time: "3-5 PM", engagement: 88 },
    { day: "Thu", time: "12-2 PM", engagement: 75 },
    { day: "Fri", time: "4-6 PM", engagement: 81 },
    { day: "Sat", time: "11-1 PM", engagement: 45 },
    { day: "Sun", time: "5-7 PM", engagement: 52 },
  ];

  const maxEngagement = Math.max(...postingTimes.map(t => t.engagement));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Understand your audience demographics</p>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Gender */}
        <div>
          <h2 className="text-sm font-medium text-black mb-6">Gender</h2>
          <div className="space-y-4">
            {genderData.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-black w-16">{item.label}</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-400 w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <h2 className="text-sm font-medium text-black mb-6">Age</h2>
          <div className="space-y-4">
            {ageData.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-black w-16">{item.label}</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-400 w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="mb-12">
        <h2 className="text-sm font-medium text-black mb-6">Top Countries</h2>
        <div className="space-y-3">
          {countryData.map((item, idx) => (
            <div key={item.country} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
              <span className="text-xs text-neutral-400 w-4">{idx + 1}</span>
              <span className="text-sm text-black flex-1">{item.country}</span>
              <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-sm text-neutral-400 w-10 text-right">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="mb-12">
        <h2 className="text-sm font-medium text-black mb-6">Best Posting Times</h2>
        <div className="flex gap-4">
          {postingTimes.map((item) => {
            const barHeight = Math.round((item.engagement / maxEngagement) * 120);
            const isHigh = item.engagement >= 80;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center">
                <span className={`text-[10px] mb-2 font-medium ${isHigh ? "text-black" : "text-neutral-400"}`}>
                  {item.engagement}%
                </span>
                <div className="w-full flex justify-center items-end" style={{ height: "120px" }}>
                  <div
                    className={`w-full max-w-[36px] rounded-md ${isHigh ? "bg-black" : "bg-neutral-200"}`}
                    style={{ height: `${barHeight}px` }}
                  />
                </div>
                <p className={`text-xs font-medium mt-3 ${isHigh ? "text-black" : "text-neutral-500"}`}>{item.day}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{item.time}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-neutral-400 mt-6 pt-4 border-t border-neutral-100">
          Based on when your audience is most active. Percentage shows relative engagement score.
        </p>
      </div>

      {/* Audience Summary */}
      <div>
        <h2 className="text-sm font-medium text-black mb-4">Audience Summary</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Your audience is predominantly female (60%), based in the United States, aged 18-24.
          They are most active on weekdays between 2-5 PM. Peak engagement days are Monday
          and Wednesday.
        </p>
      </div>
    </div>
  );
}
