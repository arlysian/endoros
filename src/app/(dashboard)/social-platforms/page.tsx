"use client";

import { useState, useEffect } from "react";

export default function SocialPlatforms() {
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramAccessToken, setInstagramAccessToken] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState([
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

  // Check login status on page load (HTTPS only)
  useEffect(() => {
    const checkLoginStatus = () => {
      if (!window.FB) {
        // SDK not loaded yet, retry
        setTimeout(checkLoginStatus, 500);
        return;
      }

      // FB.getLoginStatus requires HTTPS - skip on localhost
      if (window.location.protocol !== "https:") {
        setInstagramLoading(false);
        return;
      }

      window.FB.getLoginStatus((response: {
        status: string;
        authResponse?: { accessToken: string; userID: string }
      }) => {
        if (response.status === "connected" && response.authResponse) {
          setInstagramAccessToken(response.authResponse.accessToken);
          setInstagramConnected(true);
          console.log("Already connected. Access token:", response.authResponse.accessToken);
        }
        setInstagramLoading(false);
      });
    };

    checkLoginStatus();
  }, []);

  // Handle Facebook Login button click
  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    setInstagramLoading(true);

    window.FB.login(
      (response: { authResponse?: { accessToken: string } }) => {
        if (response.authResponse) {
          setInstagramAccessToken(response.authResponse.accessToken);
          setInstagramConnected(true);
          setInstagramLoading(false);
          console.log("Access token:", response.authResponse.accessToken);
        } else {
          setInstagramLoading(false);
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        scope: "instagram_basic,pages_read_engagement,instagram_manage_insights,pages_show_list,business_management",
      }
    );
  };

  const disconnectInstagram = () => {
    setInstagramConnected(false);
    setInstagramAccessToken(null);
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
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Social Platforms</h1>
        <p className="text-muted mt-1">Connect and manage your social media accounts</p>
      </div>

      {/* Social Platforms */}
      <section className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="space-y-4">
          {/* Instagram - Real FB Login */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Instagram</p>
                  <p className="text-sm text-muted">
                    {instagramConnected
                      ? "1 Account connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {instagramConnected ? (
                  <button
                    onClick={disconnectInstagram}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-hover transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleFacebookLogin}
                    disabled={instagramLoading}
                    className="px-4 py-2 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:bg-[#166FE5] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FacebookIcon className="w-4 h-4" />
                    {instagramLoading ? "Connecting..." : "Connect with Facebook"}
                  </button>
                )}
              </div>
            </div>

            {instagramConnected && instagramAccessToken && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Connection Status</p>
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-medium">Connected to Facebook</span>
                  </div>
                  <button
                    onClick={disconnectInstagram}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Other Platforms - Mock Data */}
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

        <button className="flex items-center gap-2 mt-4 text-[#768cff] hover:text-[#5a70e6] transition-colors">
          <PlusCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Add Another Platform</span>
        </button>
      </section>
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
