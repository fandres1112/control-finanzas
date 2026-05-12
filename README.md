# 💰 Control de Finanzas Personales

Una aplicación web moderna y premium para el control de gastos e ingresos personales, construida con las últimas tecnologías del ecosistema de React y Next.js.

## 🚀 Características

-   **Dashboard Interactivo**: Visualiza tu saldo total, ingresos y gastos del mes de un vistazo.
-   **Filtros en Tiempo Real (SPA)**: Cambia de mes o filtra el historial sin recargas de página, ofreciendo una experiencia fluida de aplicación móvil.
-   **Carga Premium con Skeletons**: Pantallas de carga elegantes que muestran la estructura de la app mientras se obtienen los datos.
-   **Actualizaciones Optimistas**: Elimina transacciones al instante. La interfaz responde de inmediato mientras el servidor trabaja en segundo plano.
-   **Gestión de Recurrencias**: 
    *   Crea plantillas de gastos/ingresos que se repiten mes a mes.
    *   Botón manual para aplicar recurrentes.
    *   **Automatización con Vercel Crons**: Configuración lista para generar transacciones automáticamente el día 1 de cada mes.
-   **Diseño Responsivo y Dark Mode**: Interfaz limpia y moderna adaptada para escritorio (y con base para móvil).

## 🛠️ Tecnologías Utilizadas

-   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Actions).
-   **Base de Datos**: [Neon](https://neon.tech/) (PostgreSQL Serverless).
-   **ORM**: [Prisma](https://www.prisma.io/) para migraciones y consultas.
-   **Autenticación**: [Clerk](https://clerk.com/) para un inicio de sesión seguro.
-   **Estilos**: Tailwind CSS.
-   **Iconos**: Lucide React.
-   **Gráficos**: Recharts (Progreso diario).

## 💻 Instalación y Configuración Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/fandres1112/control-finanzas.git
    cd control-finanzas
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables (obtenlas de tus cuentas de Clerk y Neon):
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clave_publica_de_clerk
    CLERK_SECRET_KEY=tu_clave_secreta_de_clerk
    DATABASE_URL=tu_url_de_conexion_de_neon_postgresql
    CRON_SECRET=un_token_secreto_para_las_tareas_programadas
    ```

4.  **Sincronizar la base de datos**:
    ```bash
    npx prisma db push
    ```

5.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Despliegue en Vercel

Esta aplicación está optimizada para ser desplegada en Vercel:

1.  Conecta tu repositorio de GitHub a Vercel.
2.  Agrega las variables de entorno listadas en el paso 3 en la configuración de Vercel.
3.  Vercel detectará automáticamente el archivo `vercel.json` y configurará el **Cron Job** para las transacciones recurrentes.

## 📝 Licencia

Este proyecto es de uso personal y educativo.
