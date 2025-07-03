// app/dashboard/superadmin/page.tsx
'use client'
import { useState } from 'react'

export default function SuperadminDashboard() {
  const [creating, setCreating] = useState(false)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Superadmin</h1>
      <p className="mb-4">Desde aquí podés crear colegios y asignar usuarios administradores a cada uno.</p>

      <div className="space-y-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setCreating(true)}
        >
          Crear nuevo colegio
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear usuario administrador
        </button>
      </div>

      {creating && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">Nuevo colegio</h2>
          {/* Aquí luego vamos a incluir el formulario real */}
          <p>(Formulario en construcción)</p>
        </div>
      )}
    </div>
  )
}