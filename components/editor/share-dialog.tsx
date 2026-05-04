"use client"

import { useEffect, useState } from "react"
import { Check, Copy, MailPlus, Shield, UserRoundMinus, Users } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogPattern } from "@/components/editor/dialog-pattern"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

interface CollaboratorView {
  email: string
  name: string | null
  avatarUrl: string | null
}

interface OwnerView {
  email: string | null
  name: string | null
  avatarUrl: string | null
}

interface CollaboratorResponse {
  viewerRole: "owner" | "collaborator"
  owner: OwnerView
  collaborators: CollaboratorView[]
}

function initialsFor(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "U"
  const tokens = source.split(/\s+/).filter(Boolean)
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase()
  }

  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase()
}

function Avatar({
  name,
  email,
  avatarUrl,
}: {
  name: string | null
  email: string | null
  avatarUrl: string | null
}) {
  const initials = initialsFor(name, email)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? email ?? "User avatar"}
        className="size-8 rounded-full border border-border object-cover"
      />
    )
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
      {initials}
    </div>
  )
}

export function ShareDialog({ open, onOpenChange, projectId }: ShareDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewerRole, setViewerRole] = useState<CollaboratorResponse["viewerRole"]>("collaborator")
  const [owner, setOwner] = useState<OwnerView>({
    email: null,
    name: null,
    avatarUrl: null,
  })
  const [collaborators, setCollaborators] = useState<CollaboratorView[]>([])
  const projectLink =
    typeof window === "undefined"
      ? `/editor/${projectId}`
      : `${window.location.origin}/editor/${projectId}`

  const canManage = viewerRole === "owner"

  useEffect(() => {
    if (!open) {
      return
    }

    let isMounted = true

    async function loadCollaborators() {
      setIsLoading(true)
      setErrorMessage(null)
      setInviteEmail("")

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
          {
            method: "GET",
          }
        )
        const payload = (await response.json()) as CollaboratorResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load collaborators.")
        }

        if (!isMounted) {
          return
        }

        setViewerRole(payload.viewerRole)
        setOwner(payload.owner)
        setCollaborators(Array.isArray(payload.collaborators) ? payload.collaborators : [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        const message =
          error instanceof Error ? error.message : "Failed to load collaborators."
        setErrorMessage(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCollaborators()

    return () => {
      isMounted = false
    }
  }, [open, projectId])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  async function copyProjectLink() {
    if (!projectLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(projectLink)
      setCopied(true)
    } catch {
      setErrorMessage("Clipboard access was blocked. Copy the link manually.")
    }
  }

  async function submitInvite() {
    if (!canManage || !inviteEmail.trim()) {
      return
    }

    setIsInviting(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inviteEmail }),
        }
      )
      const payload = (await response.json()) as {
        collaborator?: CollaboratorView
        error?: string
      }

      if (!response.ok || !payload.collaborator) {
        throw new Error(payload.error ?? "Failed to invite collaborator.")
      }

      setCollaborators((current) => {
        const withoutDuplicate = current.filter(
          (collaborator) => collaborator.email !== payload.collaborator?.email
        )
        return [...withoutDuplicate, payload.collaborator as CollaboratorView]
      })
      setInviteEmail("")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to invite collaborator."
      setErrorMessage(message)
    } finally {
      setIsInviting(false)
    }
  }

  async function removeCollaborator(email: string) {
    if (!canManage) {
      return
    }

    setRemovingEmail(email)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )
      const payload = (await response.json()) as {
        success?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to remove collaborator.")
      }

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.email !== email)
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove collaborator."
      setErrorMessage(message)
    } finally {
      setRemovingEmail(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-3xl border-border bg-card p-0"
        showCloseButton={false}
      >
        <DialogPattern
          title="Share Project"
          description={
            canManage
              ? "Invite teammates by email and manage project access."
              : "You can view collaborators. Only the owner can manage access."
          }
          footerActions={
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={copyProjectLink} disabled={!projectLink}>
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy link
                  </>
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-muted/30 p-3">
              <label
                htmlFor="project-link"
                className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
              >
                <Users className="size-3.5" />
                Project link
              </label>
              <Input id="project-link" value={projectLink} readOnly />
            </div>

            {canManage ? (
              <form
                className="rounded-2xl border border-border bg-muted/30 p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  void submitInvite()
                }}
              >
                <label
                  htmlFor="invite-email"
                  className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
                >
                  <MailPlus className="size-3.5" />
                  Invite by email
                </label>
                <div className="flex gap-2">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    disabled={isInviting || isLoading}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!inviteEmail.trim() || isInviting || isLoading}
                  >
                    {isInviting ? "Inviting..." : "Invite"}
                  </Button>
                </div>
              </form>
            ) : null}

            <section className="rounded-2xl border border-border bg-muted/20 p-3">
              <h4 className="mb-3 text-sm font-medium text-foreground">People with access</h4>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading collaborators...</p>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={owner.name}
                        email={owner.email}
                        avatarUrl={owner.avatarUrl}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {owner.name ?? owner.email ?? "Project owner"}
                        </p>
                        {owner.email ? (
                          <p className="truncate text-xs text-muted-foreground">{owner.email}</p>
                        ) : null}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted px-2 py-1 text-xs text-foreground">
                      <Shield className="size-3.5" />
                      Owner
                    </span>
                  </li>

                  {collaborators.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                      No collaborators added yet.
                    </li>
                  ) : (
                    collaborators.map((collaborator) => (
                      <li
                        key={collaborator.email}
                        className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar
                            name={collaborator.name}
                            email={collaborator.email}
                            avatarUrl={collaborator.avatarUrl}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {collaborator.name ?? collaborator.email}
                            </p>
                            {collaborator.name ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {collaborator.email}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {canManage ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void removeCollaborator(collaborator.email)}
                            disabled={
                              removingEmail === collaborator.email || isInviting || isLoading
                            }
                          >
                            <UserRoundMinus className="size-4" />
                            {removingEmail === collaborator.email ? "Removing..." : "Remove"}
                          </Button>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </section>

            {errorMessage ? (
              <p className="rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </DialogPattern>
      </DialogContent>
    </Dialog>
  )
}
