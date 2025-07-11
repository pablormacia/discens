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
  id: string;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    document_number?: string;
    birth_date?: string | null;
    address?: string;
    phone?: string;
  };
  profile_school: {
    school: {
      id: string;
      name: string;
    };
  }[];
  profile_roles: {
    role: {
      id: string;
      name: string;
    };
  }[];
  profile_school_levels: {
    role_id: string;
    school_id: string;
    school_level_id: string;
  }[];
}
export type Role = {
  id: string;
  name: string;
};

export type ProfileRole = {
  role: Role;
};

export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  document_number?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
};