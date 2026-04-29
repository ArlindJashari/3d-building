/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AppFocus, FeedbackSubmission, Issue, LayerState, ViewName } from './types'
import { buildings } from './mockData'

interface AppState {
  view: ViewName
  setView: (view: ViewName) => void
  buildingId: string
  setBuildingId: (id: string) => void
  layers: LayerState
  setLayers: (layers: LayerState) => void
  focus: AppFocus
  setFocus: (focus: AppFocus) => void
  createdIssues: Issue[]
  addIssue: (issue: Issue) => void
  feedback: FeedbackSubmission[]
  addFeedback: (fb: FeedbackSubmission) => void
  resetDemoData: () => void
  pushToast: (msg: string) => void
  toasts: Array<{ id: string; message: string }>
  removeToast: (id: string) => void
}

const KEYS = {
  view: 'pipe-map:view',
  building: 'pipe-map:building',
  layers: 'pipe-map:layers',
  issues: 'pipe-map:created-issues',
  feedback: 'pipe-map:feedback',
}

const initialLayers: LayerState = { cold: true, hot: true, waste: true, heating: true, gas: true, valves: true, issues: true }

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewName>(() => (localStorage.getItem(KEYS.view) as ViewName) || 'welcome')
  const [buildingId, setBuildingId] = useState(() => localStorage.getItem(KEYS.building) || buildings[0].id)
  const [layers, setLayers] = useState<LayerState>(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.layers) || 'null') || initialLayers } catch { return initialLayers }
  })
  const [createdIssues, setCreatedIssues] = useState<Issue[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.issues) || '[]') } catch { return [] }
  })
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.feedback) || '[]') } catch { return [] }
  })
  const [focus, setFocus] = useState<AppFocus>({})
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([])

  // Persistence
  useEffect(() => { localStorage.setItem(KEYS.view, view) }, [view])
  useEffect(() => { localStorage.setItem(KEYS.building, buildingId) }, [buildingId])
  useEffect(() => { localStorage.setItem(KEYS.layers, JSON.stringify(layers)) }, [layers])
  useEffect(() => { localStorage.setItem(KEYS.issues, JSON.stringify(createdIssues)) }, [createdIssues])
  useEffect(() => { localStorage.setItem(KEYS.feedback, JSON.stringify(feedback)) }, [feedback])

  const addIssue = (issue: Issue) => setCreatedIssues((prev) => [issue, ...prev])
  const addFeedback = (fb: FeedbackSubmission) => setFeedback((prev) => [fb, ...prev])

  const resetDemoData = () => {
    localStorage.removeItem(KEYS.issues)
    localStorage.removeItem(KEYS.feedback)
    localStorage.removeItem(KEYS.layers)
    setCreatedIssues([])
    setFeedback([])
    setLayers(initialLayers)
    setFocus({})
  }

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const pushToast = useCallback((msg: string) => {
    const toast = { id: `t-${Date.now()}`, message: msg }
    setToasts((prev) => [toast, ...prev].slice(0, 4))
    setTimeout(() => removeToast(toast.id), 3000)
  }, [removeToast])

  return (
    <AppContext.Provider value={{
      view, setView,
      buildingId, setBuildingId,
      layers, setLayers,
      focus, setFocus,
      createdIssues, addIssue,
      feedback, addFeedback,
      resetDemoData,
      pushToast, toasts, removeToast
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
