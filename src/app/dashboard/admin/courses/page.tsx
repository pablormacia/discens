'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, Pencil } from 'lucide-react'
import { CreateCourseDialog } from '@/components/dashboard/CreateCourseDialog'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'

export default function CoursesPage() {
  const [open, setOpen] = useState(false)
  const [levelsWithCourses, setLevelsWithCourses] = useState<unknown[]>([])
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const supabase = createClient()

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: profileSchool } = await supabase
      .from('profile_school')
      .select('school_id')
      .eq('profile_id', user.id)
      .single()

    if (!profileSchool?.school_id) return

    const { data: levels } = await supabase
      .from('school_levels')
      .select(`
        id,
        name,
        school_courses (
          id,
          name
        )
      `)
      .eq('school_id', profileSchool.school_id)

    setLevelsWithCourses(levels || [])
  }

  useEffect(() => {
    fetchData()
  }, [open])

  const handleDelete = async (courseId: string) => {
    const confirm = window.confirm('¿Estás seguro de que querés eliminar este curso?')
    if (!confirm) return

    await supabase.from('school_courses').delete().eq('id', courseId)
    fetchData()
  }

  const startEditing = (courseId: string, currentName: string) => {
    setEditingCourseId(courseId)
    setEditedName(currentName)
  }

  const handleUpdate = async (courseId: string) => {
    if (!editedName.trim()) return

    await supabase
      .from('school_courses')
      .update({ name: editedName.trim() })
      .eq('id', courseId)

    setEditingCourseId(null)
    setEditedName('')
    fetchData()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cursos por nivel</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo curso
        </Button>
      </div>

      <div className="space-y-6">
        {levelsWithCourses.map((level) => (
          <div key={level.id}>
            <h2 className="text-lg font-semibold mb-2">{level.name}</h2>
            <div className="flex flex-wrap gap-3">
              {level.school_courses?.map((course: unknown) => (
                <div
                  key={course.id}
                  className="relative bg-gray-100 px-4 py-2 rounded-md text-sm shadow flex items-center gap-2"
                >
                  {editingCourseId === course.id ? (
                    <>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-7 w-32 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(course.id)
                          if (e.key === 'Escape') setEditingCourseId(null)
                        }}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdate(course.id)}
                      >
                        ✅
                      </Button>
                    </>
                  ) : (
                    <>
                      {course.name}
                      <Pencil
                        size={16}
                        className="cursor-pointer text-muted-foreground hover:text-black"
                        onClick={() => startEditing(course.id, course.name)}
                      />
                    </>
                  )}

                  <X
                    size={16}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer"
                    onClick={() => handleDelete(course.id)}
                  />
                </div>
              ))}

              {level.school_courses?.length === 0 && (
                <span className="text-gray-500 text-sm">Sin cursos aún</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateCourseDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
