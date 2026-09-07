import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../context/TicketContext'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useEquipments } from '../context/EquipmentContext'
import { URGENCY_OPTIONS } from '../data/mockData'

export default function NewTicket() {
  const navigate = useNavigate()
  const { createTicket } = useTickets()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { equipments, loading: equipmentsLoading } = useEquipments()

  const [form, setForm] = useState({
    equipmentId: '',
    title: '',
    description: '',
    urgency: 'medium',
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'File must be under 5 MB' }))
      return
    }
    setPhotoPreview(URL.createObjectURL(file))
    update('photo', file.name)
  }

  const validate = () => {
    const errs = {}
    if (!form.equipmentId) errs.equipmentId = 'Select an equipment'
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const ticket = await createTicket({
        equipmentId: form.equipmentId,
        title: form.title.trim(),
        description: form.description.trim(),
        urgency: form.urgency,
        photo: form.photo ?? null,
        createdBy: user.name,
        assignedTo: user.role === 'technician' ? user.id : null,
      })

      addNotification({
        type: form.urgency === 'critical' ? 'critical' : 'update',
        title: 'New ticket',
        message: `${ticket.numero_ticket ?? ticket.id} — ${form.title.trim()}`,
        timestamp: new Date().toISOString(),
      })

      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Error creating ticket' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">New ticket</h2>
        <p className="text-sm text-slate-500">Report a maintenance issue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {errors.submit && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {errors.submit}
          </div>
        )}
        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-slate-700">
            Equipment <span className="text-red-500">*</span>
          </label>
          <select
            id="equipment"
            value={form.equipmentId}
            onChange={(e) => update('equipmentId', e.target.value)}
            disabled={equipmentsLoading || equipments.length === 0}
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              errors.equipmentId ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
            }`}
          >
            <option value="">
              {equipmentsLoading
                ? 'Loading…'
                : equipments.length === 0
                  ? 'No equipment — contact a manager'
                  : 'Select equipment…'}
            </option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name} — {eq.location}
              </option>
            ))}
          </select>
          {errors.equipmentId && <p className="mt-1 text-xs text-red-600">{errors.equipmentId}</p>}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Brief summary of the issue"
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe the issue — symptoms, when it started, risks…"
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              errors.description ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
            }`}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Urgency</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {URGENCY_OPTIONS.map((u) => (
              <label
                key={u}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  form.urgency === u
                    ? u === 'critical'
                      ? 'border-red-300 bg-red-50 text-red-700 ring-2 ring-red-200'
                      : u === 'medium'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                        : 'border-slate-300 bg-slate-50 text-slate-700 ring-2 ring-slate-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={u}
                  checked={form.urgency === u}
                  onChange={(e) => update('urgency', e.target.value)}
                  className="sr-only"
                />
                <span className={`h-2 w-2 rounded-full ${
                  u === 'critical' ? 'bg-red-500' : u === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                {u === 'critical' ? 'Critical' : u === 'medium' ? 'Medium' : 'Low'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Photo (optional)</label>
          <div className="mt-1.5">
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="Preview" className="h-32 w-auto rounded-lg border border-slate-200 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); update('photo', null) }}
                  className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-1 text-white hover:bg-slate-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-8 transition-colors hover:border-primary-400 hover:bg-primary-50/30">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.827a4.5 4.5 0 019.193 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="mt-2 text-sm text-slate-600">Click to add a photo</span>
                <span className="text-xs text-slate-400">PNG, JPG up to 5 MB</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>
          {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
