"use client";

import { useState, useEffect } from "react";

const CACHE_KEY = "connected_accounts_cache";

type CachedAccounts = {
  instagram: { username: string } | null;
  tiktok: { username: string } | null;
};

function getCachedAccounts(): CachedAccounts {
  if (typeof window === "undefined") return { instagram: null, tiktok: null };
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return { instagram: null, tiktok: null };
}

function setCachedAccounts(accounts: CachedAccounts) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(accounts));
  } catch {}
}

export default function SocialPlatforms() {
  // Initialize from cache to prevent flash
  const [instagramConnected, setInstagramConnected] = useState(() => {
    const cached = getCachedAccounts();
    return !!cached.instagram;
  });
  const [instagramLoading, setInstagramLoading] = useState(() => {
    const cached = getCachedAccounts();
    return !cached.instagram;
  });
  const [instagramAccount, setInstagramAccount] = useState<{ username: string } | null>(() => {
    return getCachedAccounts().instagram;
  });
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const [tiktokConnected, setTiktokConnected] = useState(() => {
    const cached = getCachedAccounts();
    return !!cached.tiktok;
  });
  const [tiktokLoading, setTiktokLoading] = useState(() => {
    const cached = getCachedAccounts();
    return !cached.tiktok;
  });
  const [tiktokAccount, setTiktokAccount] = useState<{ username: string } | null>(() => {
    return getCachedAccounts().tiktok;
  });
  const [showTiktokDisconnectConfirm, setShowTiktokDisconnectConfirm] = useState(false);

  useEffect(() => {
    const checkConnectedAccounts = async () => {
      let igAccount: { username: string } | null = null;
      let ttAccount: { username: string } | null = null;

      try {
        // Check Instagram
        const igRes = await fetch("/api/connect/instagram");
        if (igRes.ok) {
          const data = await igRes.json();
          if (data.account) {
            igAccount = data.account;
            setInstagramConnected(true);
            setInstagramAccount(data.account);
          } else {
            setInstagramConnected(false);
            setInstagramAccount(null);
          }
        }
      } catch (error) {
        console.error("Failed to check Instagram:", error);
      } finally {
        setInstagramLoading(false);
      }

      try {
        // Check TikTok
        const ttRes = await fetch("/api/connect/tiktok");
        if (ttRes.ok) {
          const data = await ttRes.json();
          if (data.account) {
            ttAccount = data.account;
            setTiktokConnected(true);
            setTiktokAccount(data.account);
          } else {
            setTiktokConnected(false);
            setTiktokAccount(null);
          }
        }
      } catch (error) {
        console.error("Failed to check TikTok:", error);
      } finally {
        setTiktokLoading(false);
      }

      // Update cache
      setCachedAccounts({ instagram: igAccount, tiktok: ttAccount });
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
              // Update cache
              const cached = getCachedAccounts();
              setCachedAccounts({ ...cached, instagram: data.account });
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
      // Update cache
      const cached = getCachedAccounts();
      setCachedAccounts({ ...cached, instagram: null });
    } catch (error) {
      console.error("Failed to disconnect Instagram:", error);
    } finally {
      setShowDisconnectConfirm(false);
    }
  };

  const handleTiktokConnect = () => {
    // Redirect to TikTok authorization endpoint
    window.location.href = "/api/connect/tiktok/authorize";
  };

  const handleTiktokDisconnectClick = () => {
    setShowTiktokDisconnectConfirm(true);
  };

  const confirmTiktokDisconnect = async () => {
    try {
      await fetch("/api/connect/tiktok", { method: "DELETE" });
      setTiktokConnected(false);
      setTiktokAccount(null);
      // Update cache
      const cached = getCachedAccounts();
      setCachedAccounts({ ...cached, tiktok: null });
    } catch (error) {
      console.error("Failed to disconnect TikTok:", error);
    } finally {
      setShowTiktokDisconnectConfirm(false);
    }
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

          {!instagramConnected && !instagramLoading && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm font-medium text-black mb-2">You must have the following to continue:</p>
              <ul className="space-y-1.5 text-sm text-neutral-600">
                <li>
                  <span className="mr-1">&bull;</span>
                  A published Facebook Page (this is different than your Facebook profile).{" "}
                  <a
                    href="https://www.facebook.com/business/help/1199464373557428"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:no-underline"
                  >
                    How to create a new Page on Facebook
                  </a>
                </li>
                <li>
                  <span className="mr-1">&bull;</span>
                  An Instagram professional account.{" "}
                  <a
                    href="https://help.instagram.com/2358103564437429"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:no-underline"
                  >
                    How to set up a professional creator account on Instagram
                  </a>
                </li>
                <li>
                  <span className="mr-1">&bull;</span>
                  Link your Facebook Page and Instagram professional accounts.{" "}
                  <a
                    href="https://www.facebook.com/business/help/898752960195806"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:no-underline"
                  >
                    How to connect a Facebook Page and Instagram account
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* TikTok */}
        <div className="pb-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TikTokIcon className="w-5 h-5 text-black" />
              <div>
                <p className="text-sm font-medium text-black">TikTok</p>
                <p className="text-xs text-neutral-400">
                  {tiktokConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {tiktokConnected ? (
              <button
                onClick={handleTiktokDisconnectClick}
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleTiktokConnect}
                disabled={tiktokLoading}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {tiktokLoading ? "..." : "Connect"}
              </button>
            )}
          </div>

          {tiktokConnected && tiktokAccount && (
            <div className="mt-4 flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                <span className="text-sm text-black">@{tiktokAccount.username}</span>
              </div>
              <button
                onClick={handleTiktokDisconnectClick}
                className="text-neutral-400 hover:text-black transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Disconnect Instagram Modal */}
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

      {/* Disconnect TikTok Modal */}
      {showTiktokDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-2">Disconnect TikTok?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              You will need to reconnect to access your metrics again.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowTiktokDisconnectConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTiktokDisconnect}
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
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagram-gradient)" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth={1.5} />
      <circle cx="18" cy="6" r="1.5" fill="url(#instagram-gradient)" />
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

