import { Link, useNavigate } from 'react-router-dom'
import AddEquipmentForm from '../components/AddEquipmentForm'

export default function NewEquipment() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          to="/equipments"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to list
        </Link>
        <h2 className="text-xl font-bold text-slate-900">New equipment</h2>
        <p className="text-sm text-slate-500">Add equipment for tickets</p>
      </div>

      <AddEquipmentForm onCreated={() => navigate('/equipments')} />
    </div>
  )
}
