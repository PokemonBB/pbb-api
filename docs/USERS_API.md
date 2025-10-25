# API de Usuarios

## Endpoints Disponibles

### 1. Listar Usuarios

**GET** `/api/users`

**Respuesta:**

```json
[
  {
    "id": "64f8b1234567890abcdef123",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "role": "USER",
    "createdAt": "2023-09-05T10:30:00.000Z",
    "updatedAt": "2023-09-05T10:30:00.000Z"
  }
]
```

### 2. Obtener Usuario por ID

**GET** `/api/users/:id`

**Parámetros:**

- `id` (string): ID del usuario

**Respuesta:**

```json
{
  "id": "64f8b1234567890abcdef123",
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "role": "USER",
  "createdAt": "2023-09-05T10:30:00.000Z",
  "updatedAt": "2023-09-05T10:30:00.000Z"
}
```

### 3. Actualizar Usuario

**PATCH** `/api/users/:id`

**Parámetros:**

- `id` (string): ID del usuario

**Body:**

```json
{
  "username": "nuevo_usuario",
  "email": "nuevo@ejemplo.com",
  "password": "nueva_contraseña",
  "role": "ADMIN"
}
```

**Respuesta:**

```json
{
  "id": "64f8b1234567890abcdef123",
  "username": "nuevo_usuario",
  "email": "nuevo@ejemplo.com",
  "role": "ADMIN",
  "createdAt": "2023-09-05T10:30:00.000Z",
  "updatedAt": "2023-09-05T15:45:00.000Z"
}
```

### 4. Eliminar Usuario

**DELETE** `/api/users/:id`

**Parámetros:**

- `id` (string): ID del usuario

**Respuesta:**

```json
{
  "id": "64f8b1234567890abcdef123",
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "role": "USER",
  "createdAt": "2023-09-05T10:30:00.000Z",
  "updatedAt": "2023-09-05T10:30:00.000Z"
}
```

## Características

- **Sin Contraseñas**: Los endpoints no retornan contraseñas por seguridad
- **Timestamps**: Incluye `createdAt` y `updatedAt` automáticamente
- **Roles**: Soporte para roles ROOT, ADMIN y USER
- **Validación**: DTOs con validaciones de entrada
- **MongoDB**: Almacenamiento en base de datos MongoDB

## Endpoints de Usuario Autenticado

### Actualizar Configuración Personal

**PATCH** `/api/users/me/configuration`

**Descripción:** Permite al usuario autenticado actualizar su configuración personal (idioma y tema).

**Autenticación:** Requerida (JWT)

**Body:**

```json
{
  "language": "es",
  "theme": "dark"
}
```

**Campos disponibles:**

- `language` (opcional): `"es"` o `"en"`
- `theme` (opcional): `"system"`, `"dark"` o `"light"`

**Respuesta exitosa (200):**

```json
{
  "id": "64f8b1234567890abcdef123",
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "role": "USER",
  "active": true,
  "configuration": {
    "language": "es",
    "theme": "dark"
  },
  "createdAt": "2023-09-05T10:30:00.000Z",
  "updatedAt": "2023-09-05T10:30:00.000Z"
}
```

**Ejemplos de uso:**

1. **Establecer idioma y tema:**

```json
{
  "language": "en",
  "theme": "light"
}
```

2. **Solo cambiar idioma:**

```json
{
  "language": "es"
}
```

3. **Solo cambiar tema:**

```json
{
  "theme": "system"
}
```

**Notas importantes:**

- La configuración es opcional y puede ser `null`
- No se crean valores por defecto automáticamente
- Solo el usuario autenticado puede modificar su propia configuración
- Los campos no enviados no se modifican

## Códigos de Error

- **400**: Bad Request - Datos de entrada inválidos
- **401**: Unauthorized - No autenticado
- **404**: Not Found - Usuario no encontrado
- **500**: Internal Server Error - Error del servidor
