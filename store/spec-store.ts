import { createStore } from 'zustand/vanilla'

export interface ProjectSpec {
  id: string
  projectId: string
  createdAt: string
  filename: string
  filePath: string
}

export interface SpecState {
  specs: ProjectSpec[]
  isLoading: boolean
  projectId: string | null
}

export interface SpecActions {
  setProjectId: (id: string) => void
  fetchSpecs: (projectId?: string) => Promise<void>
  addSpec: (spec: ProjectSpec) => void
}

export type SpecStore = SpecState & SpecActions

export const createSpecStore = (initProps: Partial<SpecState>) => {
  return createStore<SpecStore>((set, get) => ({
    specs: [],
    isLoading: false,
    projectId: initProps.projectId ?? null,
    
    setProjectId: (id) => set({ projectId: id }),
    
    fetchSpecs: async (overrideProjectId) => {
      const projectId = overrideProjectId ?? get().projectId
      if (!projectId) return
      
      set({ isLoading: true })
      try {
        const response = await fetch(`/api/projects/${projectId}/specs?_t=${Date.now()}`, {
          cache: "no-store"
        })
        if (response.ok) {
          const data = await response.json()
          set({ specs: data })
        }
      } catch (error) {
        console.error("Failed to fetch specs:", error)
      } finally {
        set({ isLoading: false })
      }
    },
    
    addSpec: (spec) => set((state) => ({ specs: [spec, ...state.specs] }))
  }))
}
