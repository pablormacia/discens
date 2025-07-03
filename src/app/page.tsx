// app/page.tsx
import { Button } from "@/components/ui/button"
import { School } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <School className="w-12 h-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Discens</h1>
          <p className="text-gray-600">Gestión escolar</p>
        </div>

        <Link href="/login">
          <Button className="text-white bg-blue-600 hover:bg-blue-700 text-lg px-6 py-2">
            Acceder
          </Button>
        </Link>
      </div>
    </main>
  )
}
