# Documentación de la API PBB

Bienvenido a la documentación de la API de PBB (PBB API). Esta documentación contiene toda la información necesaria para entender y utilizar la API.

## 📚 Índice de Documentación

### 🔐 Autenticación

- [API de Autenticación](./AUTH_API.md) - Endpoints de registro, login, perfil y logout

### 👥 Usuarios

- [API de Usuarios](./USERS_API.md) - Gestión de usuarios (CRUD)

### 🛠️ Configuración

- [Configuración del Proyecto](./SETUP.md) - Guía de instalación y configuración
- [Variables de Entorno](./ENVIRONMENT.md) - Variables de entorno requeridas

## 🚀 Inicio Rápido

1. **Instalar dependencias:**

   ```bash
   yarn install
   ```

2. **Configurar variables de entorno:**

   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Ejecutar la aplicación:**
   ```bash
   yarn start:dev
   ```

## 📡 Endpoints Principales

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🔧 Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **class-validator** - Validación de DTOs
- **Passport** - Estrategias de autenticación

## 📝 Notas

- Todos los endpoints requieren el prefijo `/api`
- La autenticación se maneja mediante cookies HTTP-only
- Los tokens JWT tienen una duración de 24 horas
- Las contraseñas se hashean automáticamente con bcryptjs
