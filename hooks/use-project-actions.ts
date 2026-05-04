"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { type EditorProject } from "@/types/editor-project"

type ActiveDialog = "create" | "rename" | "delete" | null

interface LoadingState {
  create: boolean
  rename: boolean
  delete: boolean
}

interface UseProjectActionsOptions {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function generateShortSuffix() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6)
}

function getErrorMessage(status: number) {
  switch (status) {
    case 400:
      return "Invalid project request."
    case 401:
      return "You must be signed in to perform this action."
    case 403:
      return "You do not have permission to perform this action."
    case 404:
      return "Project not found."
    case 409:
      return "Project id already exists. Try again."
    default:
      return "Project action failed."
  }
}

export function useProjectActions({ ownedProjects, sharedProjects }: UseProjectActionsOptions) {
  const router = useRouter()
  const pathname = usePathname()

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [createProjectName, setCreateProjectName] = useState("")
  const [renameProjectName, setRenameProjectName] = useState("")
  const [createSuffix, setCreateSuffix] = useState(() => generateShortSuffix())
  const [loading, setLoading] = useState<LoadingState>({
    create: false,
    rename: false,
    delete: false,
  })

  const allProjects = useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects]
  )

  const selectedProject = useMemo(
    () => allProjects.find((project) => project.id === selectedProjectId) ?? null,
    [allProjects, selectedProjectId]
  )

  const createRoomIdPreview = useMemo(() => {
    const slug = toSlug(createProjectName)
    return `${slug || "project"}-${createSuffix}`
  }, [createProjectName, createSuffix])

  const closeDialog = () => {
    setActiveDialog(null)
    setSelectedProjectId(null)
    setCreateProjectName("")
    setRenameProjectName("")
  }

  const openCreateDialog = () => {
    setCreateSuffix(generateShortSuffix())
    setCreateProjectName("")
    setActiveDialog("create")
  }

  const openRenameDialog = (projectId: string) => {
    const project = ownedProjects.find((item) => item.id === projectId)
    if (!project) {
      return
    }

    setSelectedProjectId(project.id)
    setRenameProjectName(project.name)
    setActiveDialog("rename")
  }

  const openDeleteDialog = (projectId: string) => {
    const project = ownedProjects.find((item) => item.id === projectId)
    if (!project) {
      return
    }

    setSelectedProjectId(project.id)
    setActiveDialog("delete")
  }

  const submitCreateProject = async () => {
    const name = createProjectName.trim()
    if (!name) {
      return
    }

    const roomId = createRoomIdPreview

    setLoading((current) => ({ ...current, create: true }))

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          id: roomId,
        }),
      })

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status))
      }

      closeDialog()
      router.push(`/editor/${roomId}`)
    } finally {
      setLoading((current) => ({ ...current, create: false }))
    }
  }

  const submitRenameProject = async () => {
    const name = renameProjectName.trim()
    if (!name || !selectedProjectId) {
      return
    }

    setLoading((current) => ({ ...current, rename: true }))

    try {
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status))
      }

      closeDialog()
      router.refresh()
    } finally {
      setLoading((current) => ({ ...current, rename: false }))
    }
  }

  const submitDeleteProject = async () => {
    if (!selectedProjectId) {
      return
    }

    const projectId = selectedProjectId
    const activeWorkspacePath = `/editor/${projectId}`

    setLoading((current) => ({ ...current, delete: true }))

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status))
      }

      closeDialog()

      if (pathname === activeWorkspacePath) {
        router.replace("/editor")
        return
      }

      router.refresh()
    } finally {
      setLoading((current) => ({ ...current, delete: false }))
    }
  }

  return {
    selectedProject,
    createProjectName,
    renameProjectName,
    createRoomIdPreview,
    isCreateDialogOpen: activeDialog === "create",
    isRenameDialogOpen: activeDialog === "rename",
    isDeleteDialogOpen: activeDialog === "delete",
    loading,
    setCreateProjectName,
    setRenameProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitCreateProject,
    submitRenameProject,
    submitDeleteProject,
  }
}
