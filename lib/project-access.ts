import { auth, currentUser } from "@clerk/nextjs/server"

import { clerkSignInPath } from "@/lib/clerk-routes"
import { prisma } from "@/lib/prisma"

/**
 * Get the current authenticated user's ID and primary email address.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUserIdentity() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await currentUser()
  const primaryEmail = user?.primaryEmailAddress?.emailAddress

  if (!primaryEmail) {
    return null
  }

  return {
    userId,
    email: primaryEmail,
  }
}

/**
 * Check if the current user has access to a project.
 * Returns the project if access is granted, or null otherwise.
 */
export async function checkProjectAccess(projectId: string) {
  const identity = await getCurrentUserIdentity()

  if (!identity) {
    return null
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        select: { email: true },
      },
    },
  })

  if (!project) {
    return null
  }

  const isOwner = project.ownerId === identity.userId
  const isCollaborator = project.collaborators.some(
    (collab) => collab.email === identity.email,
  )

  if (isOwner || isCollaborator) {
    return project
  }

  return null
}

/**
 * Get the sign-in path for redirecting unauthenticated users.
 */
export function getSignInPath() {
  return clerkSignInPath
}
