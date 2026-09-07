import { useState } from 'react'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { mapRoleToBackend } from '../utils/mappers'
import { validatePassword, getPasswordRuleStatus } from '../utils/passwordValidation'

const ALL_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'technician', label: 'Technician' },
]

export default function AddUserForm({ onCreated }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const roleOptions = ALL_ROLE_OPTIONS

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technician',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const passwordRules = getPasswordRuleStatus(form.password)

  if (!isAdmin) return null

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null, submit: null }))
    setSuccess('')
  }

  const validate = () => {
    const errs = {}
    if (!form.firstname.trim()) errs.firstname = 'First name is required'
    if (!form.lastname.trim()) errs.lastname = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) {
      errs.password = 'Password is required'
    } else if (!validatePassword(form.password).valid) {
      errs.password = 'Password does not meet the requirements'
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await usersApi.create({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: mapRoleToBackend(form.role),
      })

      setSuccess(`User ${form.firstname} ${form.lastname} created successfully`)
      setForm({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'technician',
      })
      onCreated?.()
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Error creating user' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">New user</h3>
        <p className="text-xs text-slate-500">
          Create an account and choose a role (admin, manager, or technician)
        </p>
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-slate-700">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              id="firstname"
              type="text"
              value={form.firstname}
              onChange={(e) => update('firstname', e.target.value)}
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.firstname ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.firstname && <p className="mt-1 text-xs text-red-600">{errors.firstname}</p>}
          </div>

          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-slate-700">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              id="lastname"
              type="text"
              value={form.lastname}
              onChange={(e) => update('lastname', e.target.value)}
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.lastname ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.lastname && <p className="mt-1 text-xs text-red-600">{errors.lastname}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="user-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
              errors.email ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {isAdmin && (
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="user-role"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.password ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Password requirements
          </p>
          <ul className="mt-2 space-y-1">
            {passwordRules.map((rule) => (
              <li key={rule.id} className="flex items-center gap-2 text-xs">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    rule.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {rule.valid ? '✓' : '·'}
                </span>
                <span className={rule.valid ? 'text-emerald-700' : 'text-slate-600'}>
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  )
}
