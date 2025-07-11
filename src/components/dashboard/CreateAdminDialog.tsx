'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { createAdmin } from '@/actions/createUser';
import { School } from '@/types/school';
import { useRoleId } from '@/hooks/useRoleId';
import { createClient } from '@/utils/supabase/client';

interface Props {
  onClose: () => void;
}

export function CreateAdminDialog({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolId, setSchoolId] = useState('');

  const [schools, setSchools] = useState<School[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { roleId } = useRoleId('admin');

useEffect(() => {
  const supabase = createClient();

  const fetchSchools = async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setSchools(data);
    }
  };

  fetchSchools();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await createAdmin({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      document_number: documentNumber,
      birth_date: birthDate || null,
      address,
      phone,
      school_id: schoolId,
      role_id: roleId!,
    });

    if ('error' in result) {
      setError(result.error);
    } else {
      onClose();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo administrador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>DNI</Label>
            <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de nacimiento</Label>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Dirección</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <Label>Colegio</Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un colegio" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear'}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
