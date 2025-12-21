"use client";

import { useState } from "react";

export default function InfluenceProfile() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    userName: "@john_doe",
    category: "",
    email: "john.doe@gmail.com",
    website: "",
    bio: "",
  });

  const [platforms, setPlatforms] = useState([
    {
      id: "instagram",
      name: "Instagram",
      icon: InstagramIcon,
      connected: true,
      accounts: [
        { username: "@sample_creater", primary: true, followers: "125K" },
        { username: "@sample_creater", primary: false, followers: "76K" },
      ],
    },
    {
      id: "youtube",
      name: "Youtube",
      icon: YoutubeIcon,
      connected: true,
      accounts: [
        { username: "@sample_creater", primary: true, followers: "125K" },
      ],
    },
    {
      id: "tiktok",
      name: "Tiktok",
      icon: TikTokIcon,
      connected: false,
      accounts: [],
    },
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: "Featured in Vogue Magazine", description: "Cover story feature", date: "2023-06", category: "Media" },
    { id: 2, title: "Interviewed by The New York Times", description: "In-depth article", date: "2023-08", category: "Media" },
    { id: 3, title: "Showcased at Paris Fashion Week", description: "Runway presentation", date: "2023-09", category: "Events" },
  ]);

  const [collaborations, setCollaborations] = useState([
    { id: 1, brand: "Nike", campaign: "Air Max Campaign", date: "2023-06", type: "Paid" },
    { id: 2, brand: "Adidas", campaign: "Lifestyle Collection", date: "2023-08", type: "Gifted" },
    { id: 3, brand: "Puma", campaign: "Running Series", date: "2023-07", type: "Paid" },
    { id: 4, brand: "Reebok", campaign: "CrossFit Line", date: "2023-09", type: "Paid" },
    { id: 5, brand: "Under Armour", campaign: "Training Gear", date: "2023-10", type: "Gifted" },
    { id: 6, brand: "New Balance", campaign: "Marathon Essentials", date: "2023-11", type: "Paid" },
    { id: 7, brand: "Asics", campaign: "Performance Running", date: "2023-12", type: "Gifted" },
    { id: 8, brand: "Disney", campaign: "Movie Premiere", date: "2023-09", type: "Event" },
  ]);

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

  const removeAchievement = (id: number) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const removeCollaboration = (id: number) => {
    setCollaborations(collaborations.filter(c => c.id !== id));
  };

  const removeAccount = (platformId: string, username: string) => {
    setPlatforms(platforms.map(p => {
      if (p.id === platformId) {
        return { ...p, accounts: p.accounts.filter(a => a.username !== username) };
      }
      return p;
    }));
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Influence Profile</h1>
      </div>

      {/* Basic Information */}
      <section className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Basic Information</h2>

        {/* Cover Image Upload */}
        <div className="border-2 border-dashed border-border rounded-xl p-8 mb-6 flex flex-col items-center justify-center">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-hover transition-colors mb-2">
            <UploadIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Upload Cover Image</span>
          </button>
          <p className="text-sm text-muted">JPG, PNG up to 5MB • 1200x300px recommended</p>
        </div>

        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-hover transition-colors mb-1">
              <UploadIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Profile Picture</span>
            </button>
            <p className="text-sm text-muted">JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">User Name / Creator Name</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select your primary category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20 appearance-none cursor-pointer"
            >
              <option value="">Please select</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Website (Optional)</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder=""
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">Bio / About</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#2596be]/20 resize-none"
          />
        </div>
      </section>

      {/* Social Platforms */}
      <section className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Social Platforms</h2>

        <div className="space-y-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.id} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{platform.name}</p>
                      <p className="text-sm text-muted">
                        {platform.connected
                          ? `${platform.accounts.length} Account${platform.accounts.length !== 1 ? "s" : ""} connected`
                          : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {platform.connected && (
                      <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-hover transition-colors">
                        Disconnect All
                      </button>
                    )}
                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-hover transition-colors">
                      Add Account
                    </button>
                  </div>
                </div>

                {platform.accounts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Connected Accounts</p>
                    <div className="space-y-2">
                      {platform.accounts.map((account, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{account.username}</span>
                            {account.primary && (
                              <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-foreground">
                                Primary
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-200 rounded text-xs font-medium text-muted">
                              {account.followers}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAccount(platform.id, account.username)}
                            className="text-muted hover:text-foreground transition-colors"
                          >
                            <XIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="flex items-center gap-2 mt-4 text-[#2596be] hover:text-[#1e7a9a] transition-colors">
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Another Platform</span>
        </button>
      </section>

      {/* Achievements & Highlights */}
      <section className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Achievements & Highlights</h2>

        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border border-border rounded-xl p-4 flex items-start justify-between"
            >
              <div>
                <h3 className="font-medium text-foreground mb-1">{achievement.title}</h3>
                <p className="text-sm text-muted mb-3">{achievement.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-foreground">
                    {achievement.date}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-foreground">
                    {achievement.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeAchievement(achievement.id)}
                className="text-muted hover:text-foreground transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 mt-4 text-[#2596be] hover:text-[#1e7a9a] transition-colors">
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Achievements</span>
        </button>
      </section>

      {/* Brand Collaborations */}
      <section className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Brand Collaborations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collaborations.map((collab) => (
            <div
              key={collab.id}
              className="border border-border rounded-xl p-4 flex items-start justify-between"
            >
              <div>
                <h3 className="font-medium text-foreground mb-1">{collab.brand}</h3>
                <p className="text-sm text-muted mb-3">{collab.campaign}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-foreground">
                    {collab.date}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-foreground">
                    {collab.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeCollaboration(collab.id)}
                className="text-muted hover:text-foreground transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 mt-4 text-[#2596be] hover:text-[#1e7a9a] transition-colors">
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Brand Collaboration</span>
        </button>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-[#2596be] text-white rounded-lg font-medium hover:bg-[#1e7a9a] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// Icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="4" />
      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

