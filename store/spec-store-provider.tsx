'use client'

import { type ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { useStore } from 'zustand'

import { type SpecStore, createSpecStore } from './spec-store'

export type SpecStoreApi = ReturnType<typeof createSpecStore>

export const SpecStoreContext = createContext<SpecStoreApi | undefined>(undefined)

export interface SpecStoreProviderProps {
  children: ReactNode
  projectId?: string
}

export const SpecStoreProvider = ({
  children,
  projectId,
}: SpecStoreProviderProps) => {
  const [store] = useState(() => createSpecStore({ projectId }))

  // Sync projectId prop with store state
  useEffect(() => {
    if (projectId) {
      store.getState().setProjectId(projectId)
    }
  }, [projectId, store])

  return (
    <SpecStoreContext.Provider value={store}>
      {children}
    </SpecStoreContext.Provider>
  )
}

export const useSpecStore = <T,>(
  selector: (store: SpecStore) => T,
): T => {
  const specStoreContext = useContext(SpecStoreContext)

  if (!specStoreContext) {
    throw new Error(`useSpecStore must be used within SpecStoreProvider`)
  }

  return useStore(specStoreContext, selector)
}
