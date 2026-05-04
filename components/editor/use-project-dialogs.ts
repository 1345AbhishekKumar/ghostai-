"use client"

import { useMemo, useState } from "react"

export interface EditorProject {
  id: string
  name: string
  slug: string
  isOwned: boolean
}

type ActiveDialog = "create" | "rename" | "delete" | null

interface LoadingState {
  create: boolean
  rename: boolean
  delete: boolean
}

const MOCK_PROJECTS: EditorProject[] = [
  {
    id: "analytics-platform",
    name: "Analytics Platform",
    slug: "analytics-platform",
    isOwned: true,
  },
  {
    id: "billing-engine",
    name: "Billing Engine",
    slug: "billing-engine",
    isOwned: true,
  },
  {
    id: "shared-fulfillment",
    name: "Fulfillment Service",
    slug: "fulfillment-service",
    isOwned: false,
  },
]

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<EditorProject[]>(MOCK_PROJECTS)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [createProjectName, setCreateProjectName] = useState("")
  const [renameProjectName, setRenameProjectName] = useState("")
  const [loading, setLoading] = useState<LoadingState>({
    create: false,
    rename: false,
    delete: false,
  })

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const ownedProjects = useMemo(
    () => projects.filter((project) => project.isOwned),
    [projects]
  )
  const sharedProjects = useMemo(
    () => projects.filter((project) => !project.isOwned),
    [projects]
  )

  const createSlugPreview = useMemo(
    () => toSlug(createProjectName) || "project-slug",
    [createProjectName]
  )

  const closeDialog = () => {
    setActiveDialog(null)
    setSelectedProjectId(null)
    setCreateProjectName("")
    setRenameProjectName("")
  }

  const openCreateDialog = () => {
    setActiveDialog("create")
    setCreateProjectName("")
  }

  const openRenameDialog = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project || !project.isOwned) {
      return
    }

    setSelectedProjectId(project.id)
    setRenameProjectName(project.name)
    setActiveDialog("rename")
  }

  const openDeleteDialog = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project || !project.isOwned) {
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

    setLoading((current) => ({ ...current, create: true }))

    const slug = toSlug(name)
    const id = `${slug || "project"}-${Date.now()}`
    setProjects((current) => [
      {
        id,
        name,
        slug: slug || "project",
        isOwned: true,
      },
      ...current,
    ])

    setLoading((current) => ({ ...current, create: false }))
    closeDialog()
  }

  const submitRenameProject = async () => {
    const name = renameProjectName.trim()
    if (!name || !selectedProjectId) {
      return
    }

    setLoading((current) => ({ ...current, rename: true }))

    const slug = toSlug(name) || "project"
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProjectId
          ? { ...project, name, slug }
          : project
      )
    )

    setLoading((current) => ({ ...current, rename: false }))
    closeDialog()
  }

  const submitDeleteProject = async () => {
    if (!selectedProjectId) {
      return
    }

    setLoading((current) => ({ ...current, delete: true }))

    setProjects((current) =>
      current.filter((project) => project.id !== selectedProjectId)
    )

    setLoading((current) => ({ ...current, delete: false }))
    closeDialog()
  }

  return {
    ownedProjects,
    sharedProjects,
    selectedProject,
    createProjectName,
    renameProjectName,
    createSlugPreview,
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
