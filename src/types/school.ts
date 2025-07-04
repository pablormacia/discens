export interface School {
  id: string
  name: string
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  cue: string | null
  created_at: string
  is_active: bool
}

export interface Level {
  id: string
  name: string
  cue: string | null
  school_id: string
}