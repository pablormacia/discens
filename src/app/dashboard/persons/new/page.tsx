import { createPerson } from '@/actions/persons'

export default function NewPersonPage() {
  return (
    <form action={createPerson} className="max-w-md mx-auto p-4">
      <div>
        <label>Nombre completo</label>
        <input type="text" name="full_name" required className="border p-2 w-full" />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" className="border p-2 w-full" />
      </div>
      <div>
        <label>Teléfono</label>
        <input type="text" name="phone" className="border p-2 w-full" />
      </div>
      <div>
        <label>Rol</label>
        <input type="text" name="role" className="border p-2 w-full" />
      </div>
      <div>
        <label>School ID</label>
        <input type="text" name="school_id" required className="border p-2 w-full" />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Crear</button>
    </form>
  )
}
