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

export interface Person {
  first_name: string
  last_name: string
  document_number: string
  birt_date: string
  address: string
  phone: string
  type: string
  created_at:string
  updated_at:string
}

export interface Profile {
  id: string
  person: Person
  profile_school: { school: School }[]
}