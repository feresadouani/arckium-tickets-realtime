import { Link, useNavigate } from 'react-router-dom'
import AddUserForm from '../components/AddUserForm'

export default function NewUser() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          to="/users"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to list
        </Link>
        <h2 className="text-xl font-bold text-slate-900">New user</h2>
        <p className="text-sm text-slate-500">Create an account for the team</p>
      </div>

      <AddUserForm onCreated={() => navigate('/users')} />
    </div>
  )
}
