"use client";

import { useState, useEffect } from "react";

export default function SocialPlatforms() {
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramAccount, setInstagramAccount] = useState<{ username: string } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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

  useEffect(() => {
    const checkConnectedAccounts = async () => {
      try {
        const res = await fetch("/api/connect/instagram");
        if (res.ok) {
          const data = await res.json();
          if (data.account) {
            setInstagramConnected(true);
            setInstagramAccount(data.account);
          }
        }
      } catch (error) {
        console.error("Failed to check connected accounts:", error);
      } finally {
        setInstagramLoading(false);
      }
    };

    checkConnectedAccounts();
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    setInstagramLoading(true);

    window.FB.login(
      (response: { authResponse?: { accessToken: string } }) => {
        if (response.authResponse) {
          const connectInstagram = async () => {
            try {
              const res = await fetch("/api/connect/instagram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: response.authResponse!.accessToken }),
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.error || "Failed to connect Instagram");
              }

              setInstagramConnected(true);
              setInstagramAccount(data.account);
              console.log("Instagram connected:", data.account);
            } catch (error) {
              console.error("Failed to connect Instagram:", error);
              alert(error instanceof Error ? error.message : "Failed to connect Instagram");
            } finally {
              setInstagramLoading(false);
            }
          };
          connectInstagram();
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

  const handleDisconnectClick = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = async () => {
    try {
      await fetch("/api/connect/instagram", { method: "DELETE" });
      setInstagramConnected(false);
      setInstagramAccount(null);
    } catch (error) {
      console.error("Failed to disconnect Instagram:", error);
    } finally {
      setShowDisconnectConfirm(false);
    }
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Platforms</h1>
        <p className="text-sm text-neutral-500 mt-1">Connect and manage your social accounts</p>
      </div>

      {/* Platforms List */}
      <div className="space-y-6">
        {/* Instagram */}
        <div className="pb-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <InstagramIcon className="w-5 h-5 text-black" />
              <div>
                <p className="text-sm font-medium text-black">Instagram</p>
                <p className="text-xs text-neutral-400">
                  {instagramConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {instagramConnected ? (
              <button
                onClick={handleDisconnectClick}
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleFacebookLogin}
                disabled={instagramLoading}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {instagramLoading ? "..." : "Connect"}
              </button>
            )}
          </div>

          {instagramConnected && instagramAccount && (
            <div className="mt-4 flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                <span className="text-sm text-black">@{instagramAccount.username}</span>
              </div>
              <button
                onClick={handleDisconnectClick}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Other Platforms */}
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} className="pb-6 border-b border-neutral-100 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm font-medium text-black">{platform.name}</p>
                    <p className="text-xs text-neutral-400">
                      {platform.connected
                        ? `${platform.accounts.length} connected`
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {platform.connected && (
                    <button className="text-sm text-neutral-500 hover:text-black transition-colors">
                      Disconnect
                    </button>
                  )}
                  <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                    {platform.connected ? "Add" : "Connect"}
                  </button>
                </div>
              </div>

              {platform.accounts.length > 0 && (
                <div className="mt-4 space-y-2">
                  {platform.accounts.map((account, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-black">{account.username}</span>
                        {account.primary && (
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] rounded">
                            Primary
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">{account.followers}</span>
                      </div>
                      <button
                        onClick={() => removeAccount(platform.id, account.username)}
                        className="text-neutral-400 hover:text-black transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Platform */}
        <button className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">Add platform</span>
        </button>
      </div>

      {/* Disconnect Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-2">Disconnect Instagram?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              You will need to reconnect to access your metrics again.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}
