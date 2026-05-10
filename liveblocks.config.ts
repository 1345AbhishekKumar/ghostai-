// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // NOTE: useLiveblocksFlow creates storage["flow"] = LiveObject({ nodes: LiveMap, edges: LiveMap })
    // Do NOT declare top-level "nodes"/"edges" — they live nested under "flow".
    Storage: {
      // Managed by useLiveblocksFlow (DEFAULT_STORAGE_KEY = "flow")
      flow: import("@liveblocks/client").LiveObject<{
        nodes: import("@liveblocks/client").LiveMap<string, import("@liveblocks/client").LiveObject<any>>;
        edges: import("@liveblocks/client").LiveMap<string, import("@liveblocks/client").LiveObject<any>>;
      }>;
      "ai-status-feed": import("@liveblocks/client").LiveObject<{ text?: string }>;
      "ai-chat": import("@liveblocks/client").LiveList<import("@liveblocks/client").LiveObject<any>>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        displayName: string;
        avatarUrl: string;
        cursorColor: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: never;
      // Example has two events, using a union
      // | { type: "PLAY" } 
      // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: Record<string, never>;
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>;
      // Example, rooms with a title and url
      // title: string;
      // url: string;
  }
}

export {};
