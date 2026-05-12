import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  // Proteger la ruta raíz '/'
  if (req.nextUrl.pathname === '/') {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Omitir internos de Next.js y archivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas de API
    '/(api|trpc)(.*)',
    // Siempre ejecutar para rutas de Clerk
    '/__clerk/(.*)',
  ],
};
