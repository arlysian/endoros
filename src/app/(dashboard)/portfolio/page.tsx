"use client";

import { useState, useEffect, useCallback } from "react";
interface IGMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}

interface PinnedPost {
  id: string;
  igMediaId: string;
  mediaType: string;
  imageUrl: string;
  permalink: string;
  caption: string | null;
  likeCount: number;
  commentsCount: number;
  displayOrder: number;
}

const MAX_PINS = 6;

export default function PortfolioPage() {
  const [pinnedPosts, setPinnedPosts] = useState<PinnedPost[]>([]);
  const [loadingPinned, setLoadingPinned] = useState(true);

  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [igMedia, setIgMedia] = useState<IGMediaItem[]>([]);
  const [igLoading, setIgLoading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pagingCursor, setPagingCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [unpinningId, setUnpinningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasIgConnected, setHasIgConnected] = useState(false);

  // Check if IG is connected
  useEffect(() => {
    fetch("/api/connect/instagram")
      .then((res) => res.json())
      .then((data) => setHasIgConnected(!!data.account))
      .catch(() => {});
  }, []);

  // Fetch pinned posts
  const fetchPinned = useCallback(async () => {
    try {
      const res = await fetch("/api/pinned-posts");
      if (res.ok) {
        const data = await res.json();
        setPinnedPosts(data);
        setPinnedIds(data.map((p: PinnedPost) => p.igMediaId));
      }
    } catch {
      console.error("Failed to fetch pinned posts");
    } finally {
      setLoadingPinned(false);
    }
  }, []);

  useEffect(() => {
    fetchPinned();
  }, [fetchPinned]);

  const CACHE_KEY = "ig_media_cache";
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Fetch IG media for browse modal
  const fetchMedia = useCallback(async (cursor?: string) => {
    // Try localStorage cache for initial load (no cursor)
    if (!cursor) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { media, paging, pinnedIds: cachedPinnedIds, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setIgMedia(media);
            setPinnedIds(cachedPinnedIds);
            setPagingCursor(paging?.cursors?.after || null);
            setHasMore(!!paging?.next);
            return;
          }
        }
      } catch {}
    }

    setIgLoading(true);
    setError(null);
    try {
      let url = "/api/instagram/media?limit=25";
      if (cursor) url += `&after=${cursor}`;

      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load posts");
        return;
      }

      const data = await res.json();
      if (cursor) {
        setIgMedia((prev) => [...prev, ...(data.media || [])]);
      } else {
        setIgMedia(data.media || []);
        // Cache initial page
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            media: data.media || [],
            paging: data.paging || null,
            pinnedIds: data.pinnedIds || [],
            timestamp: Date.now(),
          }));
        } catch {}
      }
      setPinnedIds(data.pinnedIds || []);
      setPagingCursor(data.paging?.cursors?.after || null);
      setHasMore(!!data.paging?.next);
    } catch {
      setError("Failed to load Instagram posts");
    } finally {
      setIgLoading(false);
    }
  }, []);

  // Open browse modal
  const openBrowse = () => {
    setShowBrowseModal(true);
    setIgMedia([]);
    fetchMedia();
  };

  // Pin a post
  const pinPost = async (igMediaId: string) => {
    setPinningId(igMediaId);
    try {
      const res = await fetch("/api/pinned-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igMediaId }),
      });

      if (res.ok) {
        const newPin = await res.json();
        setPinnedPosts((prev) => [...prev, newPin]);
        setPinnedIds((prev) => [...prev, igMediaId]);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to pin post");
      }
    } catch {
      setError("Failed to pin post");
    } finally {
      setPinningId(null);
    }
  };

  // Unpin a post
  const unpinPost = async (post: PinnedPost) => {
    setUnpinningId(post.id);
    try {
      const res = await fetch(`/api/pinned-posts?id=${post.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPinnedPosts((prev) => prev.filter((p) => p.id !== post.id));
        setPinnedIds((prev) => prev.filter((id) => id !== post.igMediaId));
      }
    } catch {
      setError("Failed to unpin post");
    } finally {
      setUnpinningId(null);
    }
  };

  const getThumbUrl = (item: IGMediaItem) => {
    if (item.media_type === "VIDEO") return item.thumbnail_url || "";
    return item.media_url || "";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Portfolio</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Pin up to {MAX_PINS} Instagram posts to showcase on your media kit
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Pinned Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-8">
        {loadingPinned
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-100 animate-pulse" />
            ))
          : pinnedPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square overflow-hidden bg-neutral-100"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Pinned post"}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-4 text-white text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
                {/* Unpin button */}
                <button
                  onClick={() => unpinPost(post)}
                  disabled={unpinningId === post.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {unpinningId === post.id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
                {/* IG link */}
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            ))}

        {/* Add button placeholder */}
        {!loadingPinned && pinnedPosts.length < MAX_PINS && (
          <button
            onClick={openBrowse}
            disabled={!hasIgConnected}
            className="aspect-square border-2 border-dashed border-neutral-300 hover:border-neutral-400 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm font-medium">Add Post</span>
          </button>
        )}
      </div>

      {!hasIgConnected && !loadingPinned && (
        <div className="text-center py-8 bg-neutral-50 rounded-xl">
          <p className="text-neutral-500 text-sm">
            Connect your Instagram account in{" "}
            <a href="/social-platforms" className="text-black underline">
              Platforms
            </a>{" "}
            to start pinning posts.
          </p>
        </div>
      )}

      {/* Browse Modal */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBrowseModal(false)}
          />
          <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Browse Instagram Posts
                </h2>
                <p className="text-sm text-neutral-500">
                  {pinnedIds.length}/{MAX_PINS} pinned
                </p>
              </div>
              <button
                onClick={() => setShowBrowseModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {igMedia.length === 0 && igLoading && (
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              )}

              {igMedia.length === 0 && !igLoading && !error && (
                <p className="text-center text-neutral-500 py-12">
                  No posts found.
                </p>
              )}

              <div className="grid grid-cols-3 gap-0.5">
                {igMedia.map((item) => {
                  const isPinned = pinnedIds.includes(item.id);
                  const isAtLimit = pinnedIds.length >= MAX_PINS;
                  const isPinning = pinningId === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isPinned) {
                          const post = pinnedPosts.find(
                            (p) => p.igMediaId === item.id
                          );
                          if (post) unpinPost(post);
                        } else if (!isAtLimit) {
                          pinPost(item.id);
                        }
                      }}
                      disabled={(!isPinned && isAtLimit) || isPinning}
                      className="relative aspect-square overflow-hidden bg-neutral-100 group disabled:opacity-50"
                    >
                      <img
                        src={getThumbUrl(item)}
                        alt={item.caption || "Instagram post"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Video indicator */}
                      {item.media_type === "VIDEO" && (
                        <div className="absolute top-2 left-2">
                          <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}

                      {/* Carousel indicator */}
                      {item.media_type === "CAROUSEL_ALBUM" && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
                          </svg>
                        </div>
                      )}

                      {/* Pinned checkmark overlay */}
                      {isPinned && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Pinning spinner */}
                      {isPinning && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}

                      {/* Hover overlay for unpinned */}
                      {!isPinned && !isPinning && !isAtLimit && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => fetchMedia(pagingCursor || undefined)}
                    disabled={igLoading}
                    className="px-6 py-2 text-sm font-medium text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {igLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
