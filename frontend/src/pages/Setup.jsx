import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validatePassword, getPasswordRuleStatus } from '../utils/passwordValidation'

export default function Setup() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { setupAdmin } = useAuth()
  const navigate = useNavigate()

  const passwordRules = getPasswordRuleStatus(form.password)

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null, submit: null }))
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

    setLoading(true)
    const result = await setupAdmin({
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })
    setLoading(false)

    if (result.success) {
      navigate(result.redirect)
    } else {
      setErrors((prev) => ({ ...prev, submit: result.error }))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03a2.652 2.652 0 00-4.354-4.354l-3.03 2.496m8.485 5.485l-3.03-2.496a2.652 2.652 0 00-4.354 4.354l2.496 3.03" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Initial setup</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create the administrator account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First name *</label>
              <input
                type="text"
                value={form.firstname}
                onChange={(e) => update('firstname', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              {errors.firstname && <p className="mt-1 text-xs text-red-600">{errors.firstname}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last name *</label>
              <input
                type="text"
                value={form.lastname}
                onChange={(e) => update('lastname', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              {errors.lastname && <p className="mt-1 text-xs text-red-600">{errors.lastname}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Password requirements</p>
            <ul className="mt-2 space-y-1">
              {passwordRules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${rule.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {rule.valid ? '✓' : '·'}
                  </span>
                  <span className={rule.valid ? 'text-emerald-700' : 'text-slate-600'}>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create administrator'}
          </button>
        </form>
      </div>
    </div>
  )
}
