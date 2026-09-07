import { Link } from 'react-router-dom'
import { useEquipments } from '../context/EquipmentContext'

export default function Equipments() {
  const { equipments, loading } = useEquipments()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Equipment</h2>
          <p className="text-sm text-slate-500">
            {equipments.length} active equipment{equipments.length !== 1 ? ' items' : ' item'}
          </p>
        </div>
        <Link
          to="/equipments/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New equipment
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : equipments.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No equipment.{' '}
            <Link to="/equipments/new" className="font-medium text-primary-600 hover:text-primary-700">
              Add one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Reference</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((eq) => (
                  <tr key={eq.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{eq.name}</td>
                    <td className="px-4 py-3 text-slate-600">{eq.location}</td>
                    <td className="px-4 py-3 text-slate-500">{eq.reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
