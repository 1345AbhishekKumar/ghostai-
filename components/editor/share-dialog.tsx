"use client"

import { useState, useEffect } from "react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogPattern } from "@/components/editor/dialog-pattern"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function ShareDialog({ open, onOpenChange, projectId }: ShareDialogProps) {
  const [loading, setLoading] = useState(false)
  const [collaborators, setCollaborators] = useState<Array<{ email: string; name?: string; avatarUrl?: string }>>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`)
      .then((r) => r.json())
      .then((data) => {
        setCollaborators(Array.isArray(data.collaborators) ? data.collaborators : [])
      })
      .catch(() => setCollaborators([]))
      .finally(() => setLoading(false))
  }, [open, projectId])

  async function submitInvite() {
    if (!inviteEmail.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      })

      if (res.ok) {
        const data = await res.json()
        setCollaborators((c) => [...c, data.collaborator])
        setInviteEmail("")
      } else {
        // ignore error for now; real app should show toast
        console.error("Invite failed", await res.text())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function removeCollaborator(email: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setCollaborators((c) => c.filter((x) => x.email !== email))
      } else {
        console.error("Remove failed", await res.text())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    const link = `${location.origin}/editor/${projectId}`
    void navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onOpenChange(false)
      }}
    >
      <DialogContent className="max-w-md rounded-3xl border-border bg-card p-0" showCloseButton={false}>
        <DialogPattern
          title="Share Project"
          description="Invite collaborators by email, view and remove existing collaborators. Owners only can invite or remove."
          footerActions={
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Close
              </Button>
              <Button type="button" onClick={copyLink} disabled={loading}>
                {copied ? "Copied!" : "Copy project link"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="invite@domain.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="button" onClick={submitInvite} disabled={loading || !inviteEmail.trim()}>
                Invite
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-medium">Collaborators</h4>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collaborators</p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {collaborators.map((c) => (
                    <li key={c.email} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted" aria-hidden />
                        <div>
                          <div className="text-sm font-medium">{c.name ?? c.email}</div>
                          {c.name ? <div className="text-xs text-muted-foreground">{c.email}</div> : null}
                        </div>
                      </div>

                      <div>
                        <Button type="button" variant="ghost" onClick={() => removeCollaborator(c.email)} disabled={loading}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogPattern>
      </DialogContent>
    </Dialog>
  )
}
