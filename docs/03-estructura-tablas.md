# Discens - Tablas principales

## Tabla: persons

| Campo      | Tipo    | Notas                      |
|------------|---------|----------------------------|
| id         | UUID    | PRIMARY KEY                |
| school_id  | UUID    | FK a schools               |
| full_name  | text    | requerido                  |
| email      | text    | único                      |
| phone      | text    | opcional                   |
| role       | text    | alumno, familiar, etc.     |
| created_at | timestamptz | auto                    |
| updated_at | timestamptz | trigger update          |

RLS: activada. Inserciones sólo vía service role.
