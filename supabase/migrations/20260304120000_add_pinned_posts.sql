-- Create PinnedPost table for Instagram post portfolio
CREATE TABLE "PinnedPost" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "connectedAccountId" TEXT NOT NULL REFERENCES "ConnectedAccount"(id) ON DELETE CASCADE,
    "igMediaId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "caption" TEXT,
    "likeCount" INTEGER DEFAULT 0,
    "commentsCount" INTEGER DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("userId", "igMediaId")
);

CREATE INDEX idx_pinned_post_user ON "PinnedPost"("userId");
CREATE INDEX idx_pinned_post_order ON "PinnedPost"("userId", "displayOrder");
