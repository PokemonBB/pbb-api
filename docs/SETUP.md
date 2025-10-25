# Configuración del Proyecto

## Prerrequisitos

- Node.js (versión 18 o superior)
- MongoDB (versión 5.0 o superior)
- Yarn (gestor de paquetes)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd pbb-api
```

### 2. Instalar Dependencias

```bash
yarn install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus valores:

```env
MONGO_DB_NAME=pbb_local
MONGO_USER=pbb_user
MONGO_PASSWORD=pbb_password
MONGO_PORT=27017
JWT_SECRET=tu-clave-secreta-muy-segura
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
```

### 4. Configurar MongoDB

#### Opción A: MongoDB Local

```bash
# Instalar MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Iniciar MongoDB
sudo systemctl start mongod
# o en macOS
brew services start mongodb-community
```

#### Opción B: MongoDB Docker

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=pbb_user \
  -e MONGO_INITDB_ROOT_PASSWORD=pbb_password \
  -e MONGO_INITDB_DATABASE=pbb_local \
  mongo:latest
```

### 5. Ejecutar la Aplicación

#### Desarrollo

```bash
yarn start:dev
```

#### Producción

```bash
yarn build
yarn start:prod
```

## Estructura del Proyecto

```
src/
├── auth/                 # Módulo de autenticación
│   ├── dto/              # DTOs de autenticación
│   ├── guards/           # Guards de autenticación
│   ├── strategies/        # Estrategias JWT
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                # Módulo de usuarios
│   ├── dto/              # DTOs de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── schemas/              # Esquemas de MongoDB
├── enums/                # Enumeraciones
├── config/               # Configuración
├── app.module.ts
└── main.ts
```

## Scripts Disponibles

- `yarn start` - Iniciar aplicación
- `yarn start:dev` - Iniciar en modo desarrollo
- `yarn start:debug` - Iniciar en modo debug
- `yarn start:prod` - Iniciar en modo producción
- `yarn build` - Compilar aplicación
- `yarn test` - Ejecutar tests
- `yarn lint` - Ejecutar linter

## Puertos

- **API**: 3000 (por defecto)
- **MongoDB**: 27017 (por defecto)

## URLs de Desarrollo

- **API**: http://localhost:3000/api
- **Frontend**: http://localhost:3000 (configurable)
- **Admin Panel**: http://localhost:3001 (configurable)
