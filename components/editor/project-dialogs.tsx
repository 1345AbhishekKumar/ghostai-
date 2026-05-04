"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogPattern } from "@/components/editor/dialog-pattern"

interface ProjectDialogsProps {
  isCreateDialogOpen: boolean
  isRenameDialogOpen: boolean
  isDeleteDialogOpen: boolean
  createProjectName: string
  renameProjectName: string
  createRoomIdPreview: string
  selectedProjectName: string
  loading: {
    create: boolean
    rename: boolean
    delete: boolean
  }
  onCreateProjectNameChange: (value: string) => void
  onRenameProjectNameChange: (value: string) => void
  onCloseDialog: () => void
  onSubmitCreateProject: () => void
  onSubmitRenameProject: () => void
  onSubmitDeleteProject: () => void
}

export function ProjectDialogs({
  isCreateDialogOpen,
  isRenameDialogOpen,
  isDeleteDialogOpen,
  createProjectName,
  renameProjectName,
  createRoomIdPreview,
  selectedProjectName,
  loading,
  onCreateProjectNameChange,
  onRenameProjectNameChange,
  onCloseDialog,
  onSubmitCreateProject,
  onSubmitRenameProject,
  onSubmitDeleteProject,
}: ProjectDialogsProps) {
  return (
    <>
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDialog()
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-0" showCloseButton={false}>
          <DialogPattern
            title="Create Project"
            footerActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseDialog}
                  disabled={loading.create}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onSubmitCreateProject}
                  disabled={loading.create || !createProjectName.trim()}
                >
                  {loading.create ? "Creating..." : "Create Project"}
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <label htmlFor="create-project-name" className="text-sm font-medium text-foreground">
                Project name
              </label>
              <Input
                id="create-project-name"
                value={createProjectName}
                onChange={(event) => onCreateProjectNameChange(event.target.value)}
                autoFocus
                placeholder="Distributed cache redesign"
                required
              />
              <p className="text-sm text-muted-foreground">
                Room ID preview: <span className="text-foreground">{createRoomIdPreview}</span>
              </p>
            </div>
          </DialogPattern>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDialog()
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-0" showCloseButton={false}>
          <DialogPattern
            title="Rename Project"
            description={`Current project name: ${selectedProjectName}`}
            footerActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseDialog}
                  disabled={loading.rename}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onSubmitRenameProject}
                  disabled={loading.rename || !renameProjectName.trim()}
                >
                  {loading.rename ? "Saving..." : "Save"}
                </Button>
              </>
            }
          >
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                onSubmitRenameProject()
              }}
            >
              <label htmlFor="rename-project-name" className="text-sm font-medium text-foreground">
                Project name
              </label>
              <Input
                id="rename-project-name"
                value={renameProjectName}
                onChange={(event) => onRenameProjectNameChange(event.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
                Submit
              </button>
            </form>
          </DialogPattern>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDialog()
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-0" showCloseButton={false}>
          <DialogPattern
            title="Delete Project"
            description={`Delete "${selectedProjectName}" permanently? This action cannot be undone.`}
            footerActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseDialog}
                  disabled={loading.delete}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onSubmitDeleteProject}
                  disabled={loading.delete}
                >
                  {loading.delete ? "Deleting..." : "Delete Project"}
                </Button>
              </>
            }
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
