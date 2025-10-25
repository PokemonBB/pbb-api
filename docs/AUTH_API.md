# API de Autenticación

## Endpoints Disponibles

### 1. Registro de Usuario

**POST** `/api/auth/register`

**Body:**

```json
{
  "username": "usuario123",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64f8b1234567890abcdef123",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

### 2. Inicio de Sesión

**POST** `/api/auth/login`

**Body:**

```json
{
  "username": "usuario123",
  "password": "contraseña123"
}
```

**Respuesta:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "64f8b1234567890abcdef123",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

### 3. Perfil de Usuario (Protegido)

**GET** `/api/auth/profile`

**Headers:** Cookie con token JWT

**Respuesta:**

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "64f8b1234567890abcdef123",
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

### 4. Cerrar Sesión

**POST** `/api/auth/logout`

**Respuesta:**

```json
{
  "message": "Logout successful"
}
```

## Características de Seguridad

- **JWT Tokens**: Los tokens se almacenan en cookies HTTP-only
- **Hash de Contraseñas**: Las contraseñas se hashean con bcryptjs
- **Validación**: DTOs con validaciones de entrada
- **CORS**: Configurado para permitir credenciales
- **Cookies Seguras**: Configuración de seguridad para cookies

## Variables de Entorno Requeridas

```env
MONGO_DB_NAME=pbb_local
MONGO_USER=pbb_user
MONGO_PASSWORD=pbb_password
MONGO_PORT=27017
JWT_SECRET=tu-clave-secreta-muy-segura
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Roles de Usuario

- **ROOT**: Acceso completo al sistema
- **ADMIN**: Acceso administrativo
- **USER**: Usuario estándar (por defecto)

## Uso con Frontend

Los tokens JWT se almacenan automáticamente en cookies, por lo que el frontend no necesita manejar tokens manualmente. Las cookies se envían automáticamente con cada request.
