import { useState } from 'react'
import { useEquipments } from '../context/EquipmentContext'

export default function AddEquipmentForm({ onCreated }) {
  const { createEquipment } = useEquipments()
  const [form, setForm] = useState({ name: '', location: '', reference: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null, submit: null }))
    setSuccess('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.location.trim()) errs.location = 'Location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createEquipment({
        name: form.name.trim(),
        location: form.location.trim(),
        reference: form.reference.trim(),
      })
      setSuccess(`Equipment "${form.name.trim()}" added successfully`)
      setForm({ name: '', location: '', reference: '' })
      onCreated?.()
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Error creating equipment' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">New equipment</h3>
        <p className="text-xs text-slate-500">Add equipment available for tickets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
            {success}
          </div>
        )}
        {errors.submit && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {errors.submit}
          </div>
        )}

        <div>
          <label htmlFor="eq-name" className="block text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="eq-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. CNC Mill #3"
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm ${
              errors.name ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="eq-location" className="block text-sm font-medium text-slate-700">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="eq-location"
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Building A - Floor 2"
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm ${
              errors.location ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="eq-reference" className="block text-sm font-medium text-slate-700">
            Reference (optional)
          </label>
          <input
            id="eq-reference"
            type="text"
            value={form.reference}
            onChange={(e) => update('reference', e.target.value)}
            placeholder="e.g. EQ-001"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add equipment'}
          </button>
        </div>
      </form>
    </div>
  )
}
