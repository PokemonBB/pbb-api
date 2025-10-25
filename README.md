# PBB API

API REST desarrollada con NestJS para el sistema PBB (PBB System).

## 🚀 Características

- **Autenticación JWT** con cookies HTTP-only
- **Gestión de Usuarios** con roles (ROOT, ADMIN, USER)
- **Base de Datos MongoDB** con Mongoose
- **Validación de DTOs** con class-validator
- **CORS configurado** para múltiples orígenes
- **Documentación completa** en el directorio `docs/`

## 📚 Documentación

Toda la documentación está disponible en el directorio [`docs/`](./docs/README.md):

- [Configuración del Proyecto](./docs/SETUP.md)
- [API de Autenticación](./docs/AUTH_API.md)
- [API de Usuarios](./docs/USERS_API.md)
- [Variables de Entorno](./docs/ENVIRONMENT.md)

## 🛠️ Instalación

```bash
# Instalar dependencias
yarn install

# Configurar variables de entorno
cp docs/env.example .env
# Editar .env con tus valores

# Ejecutar en desarrollo
yarn start:dev
```

## 📡 Endpoints Principales

- **POST** `/api/auth/register` - Registro de usuario
- **POST** `/api/auth/login` - Inicio de sesión
- **GET** `/api/auth/profile` - Perfil del usuario
- **POST** `/api/auth/logout` - Cerrar sesión
- **GET** `/api/users` - Listar usuarios
- **GET** `/api/users/:id` - Obtener usuario

## 🔧 Scripts Disponibles

```bash
# Desarrollo
yarn start:dev

# Producción
yarn build
yarn start:prod

# Testing
yarn test
yarn test:e2e

# Linting
yarn lint
```

## 🏗️ Tecnologías

- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **class-validator** - Validación de DTOs
- **Passport** - Estrategias de autenticación

## 📝 Licencia

Este proyecto está bajo la licencia MIT.
