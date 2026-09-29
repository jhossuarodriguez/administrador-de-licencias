# Administrador de Licencias

Sistema de gestión de licencias desarrollado con Next.js 14, TypeScript, Prisma y Tailwind CSS.

## 🚀 Tecnologías Utilizadas

- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **Base de Datos:** Prisma ORM
- **Estilos:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Gráficos:** Recharts
- **Gestión de Estado:** SWR
- **Iconos:** Lucide React

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd license-administrator

# Instalar dependencias
pnpm install

# Configurar variables de entorno (ver "Autenticación")
cp .env.example .env

# Configurar base de datos
npx prisma generate
npx prisma db push
npx prisma db seed

# Ejecutar en desarrollo
pnpm dev
```

## 🔐 Autenticación

La autenticación usa [Better Auth](https://www.better-auth.com) (`src/lib/auth.ts`) con tres métodos de acceso:

- Usuario o email + contraseña
- GitHub
- Google

El primer usuario que se registra (con cualquier método) queda como `ADMIN` y los siguientes como `USER`. Al desplegar con Docker sobre una base vacía, `prisma/seed.ts` crea el administrador inicial con las variables `SEED_ADMIN_NAME`, `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`.

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `APP_URL` | URL pública de la app (la del navegador). Better Auth arma con ella las URLs de callback de OAuth. |
| `BETTER_AUTH_SECRET` | Secreto para firmar las sesiones. Generar con `openssl rand -base64 32`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Credenciales de la OAuth App de GitHub. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciales del cliente OAuth de Google. |

Un proveedor sin credenciales queda deshabilitado y su botón muestra "no disponible".

### Configurar GitHub y Google

- **GitHub**: *Settings → Developer settings → OAuth Apps → New OAuth App*, con *Authorization callback URL* `<APP_URL>/api/auth/callback/github`.
- **Google**: *Google Cloud Console → APIs y servicios → Credenciales → Crear ID de cliente de OAuth* (tipo *Aplicación web*), con el URI de redireccionamiento autorizado `<APP_URL>/api/auth/callback/google`.

Detrás de Nginx, envía la IP del cliente (`proxy_set_header X-Real-IP $remote_addr;`) para que el límite de intentos de login se aplique por cliente y no a todos los usuarios a la vez.

## 📁 Estructura del Proyecto

```
src/
├── app/                          # App Router
│   ├── api/                      # API Routes
│   │   ├── dashboard/stats/      # Estadísticas
│   │   ├── licenses/            # CRUD licencias
│   │   └── users/               # CRUD usuarios
│   ├── dashboard/               # Páginas dashboard
│   └── globals.css              # Estilos globales
├── components/                  # Componentes
│   ├── ui/                      # UI base
│   ├── overview/                # Dashboard
│   ├── users/                   # Usuarios
│   └── licenses/                # Licencias
├── hooks/                       # Custom hooks
├── lib/                         # Utilidades
└── test/                        # Testing
```

## 🎯 Funcionalidades

### Dashboard
- Estadísticas en tiempo real
- Gráficos de uso mensual
- Alertas de vencimiento
- Métricas de rendimiento

### Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de licencias
- Estados activo/inactivo
- Departamentos y roles

### Gestión de Licencias
- Catálogo de licencias
- Información de costos
- Fechas de expiración
- Asignaciones por departamento

## 🔧 API Endpoints

### Dashboard Stats
```
GET /api/dashboard/stats
```
Retorna estadísticas completas del dashboard.

### Usuarios
```
GET /api/users          # Listar usuarios
POST /api/users         # Crear usuario
```

### Licencias
```
GET /api/licenses       # Listar licencias
POST /api/licenses      # Crear licencia
GET /api/licenses/costs # Información costos
```

## 🎨 Componentes Principales

### Dashboard
- `OverviewHeader`: Navegación superior
- `StatsChart`: Gráfico principal de líneas
- `BarStatsSummary`: Gráfico de barras
- `MostUsedLicenses`: Top licencias utilizadas

### Cards de Resumen
- `UsersCard`: Total usuarios nuevos
- `LicenseCard`: Total licencias
- `ActiveUsersCard`: Usuarios activos
- `ExpiringSoonCard`: Próximas a vencer

### Tablas
- `UsersTable`: Gestión de usuarios
- `LicenseTable`: Gestión de licencias
- `CostosTable`: Información financiera

## 🪝 Custom Hooks

```typescript
// Estadísticas del dashboard
const { stats, isLoading, error } = useStats()

// Gestión de usuarios
const { users, isLoading, isError } = useUsers()

// Manejo de licencias
const { license, error, isLoading } = useLicenses()

// Información de costos
const { costs, isLoading, error, refetch } = useCosts()
```

## 🎨 Sistema de Estilos

### Variables CSS Personalizadas
```css
--color-primary: oklch(0.145 0 0);
--color-secondary: #9ac4fe;
--color-sidebarBg: #f9f9f9;
--color-borderPrimary: #e5e5e5;
```

### Componentes UI
- Botones con variantes
- Cards informativos
- Inputs de formulario
- Barras de progreso
- Componentes de gráficos

## 📱 Páginas

- `/` - Login principal
- `/dashboard` - Dashboard principal
- `/dashboard/users` - Gestión usuarios
- `/dashboard/licenses` - Gestión licencias
- `/dashboard/reports` - Reportes
- `/dashboard/assignments` - Asignaciones
- `/dashboard/contracts` - Contratos
- `/dashboard/settings` - Configuración

## 🧪 Testing

```bash
# Scripts de prueba disponibles
node src/test/test-users.mjs     # API usuarios
node src/test/test-licenses.mjs  # API licencias
node src/test/testDb.mjs         # Conexión DB
```

## 🐳 Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "dev"]
```

## 📋 Scripts

```bash
pnpm dev           # Desarrollo
pnpm build         # Build producción
pnpm start         # Servidor producción
pnpm lint          # Linting
```

## 📈 Métricas Rastreadas

- Total de licencias por proveedor
- Usuarios activos y nuevos
- Licencias próximas a expirar (30 días)
- Uso mensual por usuario
- Costos e instalaciones

## 🛠️ Utilidades

### Función `cn`
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Cliente Prisma
Configurado para desarrollo y producción con pooling de conexiones.

## 🔐 Seguridad

- Validación de tipos con TypeScript
- Sanitización de inputs
- Manejo seguro de errores
- Variables de entorno protegidas

## 📱 Responsive Design

- Diseño mobile-first
- Breakpoints optimizados
- Navegación adaptativa
- Componentes flexibles

## ♿ Accesibilidad

- Componentes Radix UI
- Navegación por teclado
- ARIA labels
- Alto contraste

## 🚀 Próximos Pasos

- [x] Implementar autenticación completa (Better Auth con GitHub y Google)
- [ ] Añadir más proveedores de licencias
- [ ] Sistema de notificaciones push
- [ ] Exportación de reportes PDF
- [ ] API REST completa
- [ ] Tests automatizados

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

Desarrollado con ❤️ usando Next.js y TypeScript