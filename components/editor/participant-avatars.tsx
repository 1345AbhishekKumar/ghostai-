"use client"

import Image from "next/image"
import { useOthers } from "@liveblocks/react/suspense";
import { useUser } from "@clerk/nextjs";

export function ParticipantAvatars() {
  const others = useOthers();
  const { user } = useUser();
  const currentUserId = user?.id;

  // Filter out the current user to get collaborators
  const collaborators = currentUserId
    ? others.filter((participant) => participant.id !== currentUserId)
    : others;

  if (collaborators.length === 0) {
    return null;
  }

  // Take up to 5 collaborators
  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = Math.max(0, collaborators.length - 5);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-base-800/80 backdrop-blur rounded-full border border-base-700 shadow-sm">
      {/* Collaborator Avatars */}
      <div className="flex items-center -space-x-2 mr-1">
        {visibleCollaborators.map((user) => (
          <div
            key={user.connectionId}
            className="relative w-8 h-8 rounded-full border-2 border-base-900 bg-base-600 flex items-center justify-center overflow-hidden"
            title={user.info?.displayName || "Collaborator"}
          >
            {user.info?.avatarUrl ? (
              <Image
                src={user.info.avatarUrl}
                alt={user.info?.displayName || "Avatar"}
                width={32}
                height={32}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-white">
                {(user.info?.displayName || "C").slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {overflowCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-base-900 bg-base-700 flex items-center justify-center text-xs text-white">
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
}
