# Variables de Entorno

## Variables Requeridas

### Base de Datos MongoDB

| Variable         | Descripción                | Valor por Defecto | Ejemplo        |
| ---------------- | -------------------------- | ----------------- | -------------- |
| `MONGO_DB_NAME`  | Nombre de la base de datos | -                 | `pbb_local`    |
| `MONGO_USER`     | Usuario de MongoDB         | -                 | `pbb_user`     |
| `MONGO_PASSWORD` | Contraseña de MongoDB      | -                 | `pbb_password` |
| `MONGO_PORT`     | Puerto de MongoDB          | `27017`           | `27017`        |
| `MONGO_HOST`     | Host de MongoDB            | `localhost`       | `localhost`    |

### Autenticación JWT

| Variable     | Descripción            | Valor por Defecto | Ejemplo                      |
| ------------ | ---------------------- | ----------------- | ---------------------------- |
| `JWT_SECRET` | Clave secreta para JWT | `your-secret-key` | `mi-clave-super-secreta-123` |

### Aplicación

| Variable   | Descripción             | Valor por Defecto | Ejemplo      |
| ---------- | ----------------------- | ----------------- | ------------ |
| `NODE_ENV` | Entorno de ejecución    | `development`     | `production` |
| `PORT`     | Puerto de la aplicación | `3000`            | `3000`       |

### CORS

| Variable       | Descripción               | Valor por Defecto | Ejemplo                                       |
| -------------- | ------------------------- | ----------------- | --------------------------------------------- |
| `CORS_ORIGINS` | URLs permitidas para CORS | -                 | `http://localhost:3001,http://localhost:3002` |

**Nota**:

- Si no se define `CORS_ORIGINS`, se permite cualquier origen (`*`)
- Para producción, siempre definir los orígenes permitidos
- Los orígenes se separan por comas sin espacios
- Ejemplo: `http://localhost:3001,http://localhost:3002,https://mi-app.com`

### Seed Database

| Variable        | Descripción                 | Valor por Defecto | Ejemplo              |
| --------------- | --------------------------- | ----------------- | -------------------- |
| `ROOT_USERNAME` | Username del usuario root   | `admin`           | `root`               |
| `ROOT_EMAIL`    | Email del usuario root      | `admin@pbb.local` | `root@pbb.com`       |
| `ROOT_PASSWORD` | Contraseña del usuario root | -                 | `SecurePassword123!` |

## Archivo .env de Ejemplo

```env
# Base de Datos
MONGO_DB_NAME=pbb_local
MONGO_USER=pbb_user
MONGO_PASSWORD=pbb_password
MONGO_PORT=27017
MONGO_HOST=localhost

# Autenticación
JWT_SECRET=mi-clave-super-secreta-123

# Aplicación
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

## Configuración por Entorno

### Desarrollo

```env
NODE_ENV=development
MONGO_DB_NAME=pbb_dev
JWT_SECRET=dev-secret-key
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

### Producción

```env
NODE_ENV=production
MONGO_DB_NAME=pbb_prod
JWT_SECRET=clave-super-secreta-de-produccion
CORS_ORIGINS=https://mi-app.com,https://admin.mi-app.com
```

## Seguridad

### Variables Sensibles

- `JWT_SECRET`: Debe ser una cadena larga y aleatoria
- `MONGO_PASSWORD`: Debe ser una contraseña segura
- `MONGO_USER`: Usuario con permisos limitados

### Recomendaciones

1. **Nunca** commitees el archivo `.env` al repositorio
2. Usa diferentes valores para desarrollo y producción
3. Rota las claves regularmente en producción
4. Usa variables de entorno del sistema en producción

## Validación

El sistema valida automáticamente las variables de entorno al iniciar. Si alguna variable requerida no está definida, la aplicación no iniciará.
