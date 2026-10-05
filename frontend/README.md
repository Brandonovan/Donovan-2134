# SnailWin — Front

Página de apuestas de carreras de caracoles, hecha con React + Vite.

## Requisitos

- Node.js `^20.19` o `>=22.12` (lo que exige Vite 8)

## Uso

```bash
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo (http://localhost:5173)
npm run build   # build de producción en dist/
npm run lint    # linter (oxlint)
```

## Estructura

```
src/
├── app/         router y providers
├── components/  UI compartida y layouts
├── features/    auth, lobby, wallet (cada una con sus services, hooks y utils)
├── pages/       una por ruta
├── routes/      guards de rutas públicas y protegidas
└── services/    apiClient, sesión y simulación de red
```

## Autenticación y sesión

Sin backend todavía, así que ambas cosas se simulan en `localStorage` con la
forma que tendrían en un servidor.

**Contraseña.** Nunca se guarda. De ella solo queda un hash PBKDF2-SHA256 con
600.000 iteraciones (el mínimo que recomienda OWASP) y un salt de 16 bytes
propio de cada usuario, en formato autodescriptivo —
`pbkdf2-sha256$600000$<salt>$<hash>` — para poder subir las iteraciones más
adelante sin invalidar las contraseñas ya registradas. La verificación compara
en tiempo constante, y un correo inexistente consume el mismo tiempo que uno
real para que la respuesta no revele qué cuentas existen.

**Sesión.** `src/services/session.js` mantiene una tabla `token → usuario`
equivalente a la que llevaría el servidor. El token son 32 bytes aleatorios sin
significado, se emite solo tras registrar o verificar la contraseña, caduca a
las 24 horas y se revoca al cerrar sesión borrando su fila. El usuario no se
guarda aparte: se deriva del token en cada lectura, para que no pueda existir
una sesión que no corresponda a ningún registro.

**Límite conocido.** Nada de esto resiste a quien edite `localStorage`: se puede
fabricar una sesión sin pasar por el formulario, y los guards de ruta solo
deciden qué se renderiza. Una frontera real exige un servidor que rechace las
peticiones, que es justo lo que sustituirá a esta simulación.

## Conectar el backend

Los servicios ya tienen la costura preparada:

```bash
# frontend/.env.local (ignorado por git)
VITE_USE_MOCKS=false
VITE_API_URL=https://tu-backend.ejemplo.com
```

Sin esas variables, la app arranca con la simulación completa. Ten en cuenta que
todo lo que lleve el prefijo `VITE_` se incrusta en el bundle público: sirve para
configurar, no para guardar secretos.
