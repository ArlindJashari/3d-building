import React, { useState } from 'react'
import { useAppStore } from '../store'
import { Button, Panel, cx, ui } from '../styleguide'
import { MessageSquarePlus, Star, ThumbsUp, Building, User } from 'lucide-react'
import type { FeedbackSubmission } from '../types'

export function FeedbackScreen() {
  const { feedback, addFeedback, pushToast } = useAppStore()
  const fieldClass = 'w-full rounded-xl border border-white/10 bg-white/6 p-3 text-sm text-fg-primary outline-none transition placeholder:text-fg-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20'
  
  const [form, setForm] = useState({
    name: '',
    role: '',
    buildingType: 'Residential',
    frequency: 'Weekly',
    helpful: 'Yes',
    valuableFeature: '',
    missing: '',
    wouldPay: 'Yes',
    monthlyValue: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newFeedback: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      ...form
    }
    addFeedback(newFeedback)
    pushToast('Feedback saved successfully.')
    setForm({ name: '', role: '', buildingType: 'Residential', frequency: 'Weekly', helpful: 'Yes', valuableFeature: '', missing: '', wouldPay: 'Yes', monthlyValue: '', notes: '' })
  }

  return (
    <div className="grid h-full gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Panel className="flex flex-col p-0 shadow-sm">
        <div className="border-b border-white/10 bg-white/5 p-6 md:p-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent-blue/10 text-accent-blue">
            <MessageSquarePlus size={24} />
          </div>
          <h2 className={ui.text.titleLg}>Capture Demo Feedback</h2>
          <p className="mt-2 text-sm text-fg-secondary leading-relaxed">
            Use this form immediately after showing the 3D leak workflow to capture what clients understood, what felt valuable,
            and what details are missing for real building operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-auto p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Client Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input required className={`${fieldClass} pl-10`} placeholder="Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Role / Title</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
                <input required className={`${fieldClass} pl-10`} placeholder="Property Manager" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-fg-primary">Would this product help your team?</label>
            <div className="flex gap-3">
              {['Yes', 'Maybe', 'No'].map(opt => (
                <button key={opt} type="button" onClick={() => setForm({ ...form, helpful: opt })} className={cx('flex-1 rounded-sm border p-3 text-sm font-medium transition', form.helpful === opt ? 'border-accent-blue/50 bg-accent-blue/15 text-accent-blue shadow-sm' : 'border-white/10 bg-white/6 text-fg-secondary hover:border-white/20')}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-fg-primary">Which feature is most valuable?</label>
            <textarea required className={`${fieldClass} min-h-[80px]`} placeholder="e.g., Finding shut-off valves quickly..." value={form.valuableFeature} onChange={e => setForm({ ...form, valuableFeature: e.target.value })} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-medium text-fg-primary">Would you pay for this?</label>
              <div className="flex gap-3">
                {['Yes', 'Maybe', 'No'].map(opt => (
                  <button key={opt} type="button" onClick={() => setForm({ ...form, wouldPay: opt })} className={cx('flex-1 rounded-sm border p-3 text-sm font-medium transition', form.wouldPay === opt ? 'border-accent-success/50 bg-accent-success/15 text-accent-success shadow-sm' : 'border-white/10 bg-white/6 text-fg-secondary hover:border-white/20')}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-fg-primary">Estimated Monthly Value</label>
              <input className={fieldClass} placeholder="$200 / month" value={form.monthlyValue} onChange={e => setForm({ ...form, monthlyValue: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-fg-primary">Additional Notes / What's Missing?</label>
            <textarea className={`${fieldClass} min-h-[100px]`} placeholder="Client remarks..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full justify-center py-3 text-base shadow-button-primary">Save Client Feedback</Button>
          </div>
        </form>
      </Panel>

      <Panel className="flex flex-col p-0 shadow-sm">
        <div className="border-b border-white/10 bg-white/5 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-fg-primary">
            <Star size={18} className="text-accent-amber" /> Saved Responses
          </h3>
          <p className="mt-1 text-sm text-fg-secondary">{feedback.length} entries recorded</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {feedback.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ThumbsUp size={32} className="mb-4 text-fg-muted/50" />
              <p className="font-medium text-fg-primary">No feedback yet</p>
              <p className="mt-1 text-sm text-fg-muted max-w-[200px]">Submit the form on the left to record client reactions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map(fb => (
                <div key={fb.id} className="rounded-sm border border-white/10 bg-white/6 p-5 transition hover:bg-white/10">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-fg-primary">{fb.name}</h4>
                      <p className="text-xs text-fg-secondary">{fb.role}</p>
                    </div>
                    <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', fb.wouldPay === 'Yes' ? 'bg-accent-success/10 text-accent-success' : 'bg-black/5 text-fg-muted')}>
                      Pay: {fb.wouldPay}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">Most Valuable Feature</p>
                      <p className="mt-1 text-sm text-fg-primary">{fb.valuableFeature}</p>
                    </div>
                    {fb.notes && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">Notes</p>
                        <p className="mt-1 text-sm text-fg-secondary leading-relaxed">{fb.notes}</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-[10px] text-fg-muted text-right">{fb.createdAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
