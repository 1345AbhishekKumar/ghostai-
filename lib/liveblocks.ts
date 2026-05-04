import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLOR_PALETTE = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#62C073",
  "#0AC7B4",
  "#EDEDED",
] as const;

function hashUserId(userId: string): number {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getCursorColorForUser(userId: string): string {
  const colorIndex = hashUserId(userId) % CURSOR_COLOR_PALETTE.length;
  return CURSOR_COLOR_PALETTE[colorIndex];
}

const globalForLiveblocks = globalThis as {
  liveblocks?: Liveblocks;
};

export function getLiveblocksClient(): Liveblocks {
  if (globalForLiveblocks.liveblocks) {
    return globalForLiveblocks.liveblocks;
  }

  const liveblocksSecretKey = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!liveblocksSecretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set.");
  }

  const client = new Liveblocks({
    secret: liveblocksSecretKey,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForLiveblocks.liveblocks = client;
  }

  return client;
}
