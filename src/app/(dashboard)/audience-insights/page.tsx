"use client";

import { useState, useEffect } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DemographicItem {
  type: string;
  label: string;
  value: number;
}

const DEMOGRAPHICS_CACHE_KEY = "demographics_cache";
const DEMOGRAPHICS_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getCachedDemographics(): DemographicItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMOGRAPHICS_CACHE_KEY);
    if (!raw) return null;
    const { demographics, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > DEMOGRAPHICS_CACHE_TTL) return null;
    return demographics;
  } catch {
    return null;
  }
}

function setCachedDemographics(demographics: DemographicItem[]) {
  try {
    localStorage.setItem(DEMOGRAPHICS_CACHE_KEY, JSON.stringify({ demographics, timestamp: Date.now() }));
  } catch {}
}

export default function AudienceInsights() {
  const [demographics, setDemographics] = useState<DemographicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedDemographics();
    if (cached) {
      setDemographics(cached);
      setLoading(false);
    }

    async function fetchDemographics() {
      try {
        const res = await fetch("/api/demographics");
        if (res.ok) {
          const data = await res.json();
          setDemographics(data.demographics);
          setCachedDemographics(data.demographics);
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

  const countryNames: Record<string, string> = {
    AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AO: "Angola", AR: "Argentina",
    AU: "Australia", AT: "Austria", BD: "Bangladesh", BE: "Belgium", BR: "Brazil",
    CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica",
    CI: "Ivory Coast", CM: "Cameroon", CZ: "Czechia", DE: "Germany", DK: "Denmark",
    DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", ES: "Spain", FI: "Finland",
    FR: "France", GB: "United Kingdom", GH: "Ghana", GR: "Greece", GT: "Guatemala",
    HK: "Hong Kong", HU: "Hungary", ID: "Indonesia", IE: "Ireland", IL: "Israel",
    IN: "India", IQ: "Iraq", IR: "Iran", IT: "Italy", JM: "Jamaica",
    JO: "Jordan", JP: "Japan", KE: "Kenya", KR: "South Korea", KW: "Kuwait",
    LB: "Lebanon", LY: "Libya", MA: "Morocco", MG: "Madagascar", MN: "Mongolia",
    MX: "Mexico", MY: "Malaysia", MZ: "Mozambique", NG: "Nigeria", NL: "Netherlands",
    NO: "Norway", NZ: "New Zealand", PA: "Panama", PE: "Peru", PH: "Philippines",
    PK: "Pakistan", PL: "Poland", PS: "Palestine", PT: "Portugal", RO: "Romania",
    RU: "Russia", SA: "Saudi Arabia", SD: "Sudan", SE: "Sweden", SG: "Singapore",
    SN: "Senegal", SY: "Syria", TH: "Thailand", TJ: "Tajikistan", TN: "Tunisia",
    TR: "Turkey", TW: "Taiwan", TZ: "Tanzania", UA: "Ukraine", AE: "UAE",
    US: "United States", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam",
    ZA: "South Africa", ZW: "Zimbabwe",
  };

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
              <GenderDonutChart genderData={genderData} genderTotal={genderTotal} />
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
                      <span className="text-sm text-black flex-1">{countryNames[item.label] || item.label}</span>
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

const genderColors: Record<string, string> = {
  M: "#4A5FD9",
  F: "#E05C97",
  U: "#9CA3AF",
};

const genderChartConfig: ChartConfig = {
  M: { label: "Male", color: "#4A5FD9" },
  F: { label: "Female", color: "#E05C97" },
  U: { label: "Other", color: "#9CA3AF" },
};

function GenderDonutChart({
  genderData,
  genderTotal,
}: {
  genderData: DemographicItem[];
  genderTotal: number;
}) {
  const chartData = genderData.map((item) => ({
    gender: item.label,
    value: item.value,
    fill: genderColors[item.label] || "#9CA3AF",
  }));

  if (genderTotal === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-neutral-400 text-sm">
        No gender data
      </div>
    );
  }

  return (
    <div>
      <ChartContainer config={genderChartConfig} className="mx-auto aspect-square max-h-[180px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="gender"
            innerRadius={50}
            outerRadius={75}
            strokeWidth={2}
            stroke="#fff"
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-black text-2xl font-bold"
                      >
                        {genderTotal.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-neutral-400 text-xs"
                      >
                        followers
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex justify-center gap-4 mt-4">
        {chartData.map((item) => {
          const pct = Math.round((item.value / genderTotal) * 100);
          return (
            <div key={item.gender} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: genderColors[item.gender] || "#9CA3AF" }}
              />
              <span className="text-xs text-neutral-500">
                {genderChartConfig[item.gender]?.label || item.gender}
              </span>
              <span className="text-xs text-neutral-400">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
