# SnailWin — Front

Página de apuestas de carreras de caracoles, hecha con React + Vite + TypeScript.

## Requisitos

- Node.js `^20.19` o `>=22.12` (lo que exige Vite 8)

## Uso

```bash
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo (http://localhost:5173)
npm run build   # typecheck + build de producción en dist/
npm run lint    # linter (oxlint)
npm run typecheck  # solo comprobación de tipos
```

`build` comprueba los tipos antes de compilar, así que un error de tipos rompe
el despliegue en vez de llegar a producción. Vite transpila con esbuild, que no
comprueba tipos: por eso `tsc` va aparte y solo verifica.

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

## Los dos backends

La app contempla dos saltos distintos, y hoy solo el segundo existe:

```
navegador  →  backend del comercio  →  pasarela de pagos
              (simulado aquí)           (snailpay-api)
```

`src/features/wallet/merchant/` es el backend del comercio simulado: lleva el
saldo, el historial, la bóveda de medios de pago y habla con la pasarela.
**Todo eso es trabajo de servidor**; el navegador lo hace porque ese servidor no
existe todavía. El día que exista, se borra esa carpeta y `walletService` pasa a
llamarlo por HTTP: los componentes no se enteran, porque solo conocen la fachada.

```bash
# frontend/.env.local (ignorado por git)

# El comercio sigue simulado mientras esté en true.
VITE_USE_MOCKS=true

# Pasarela de pagos. Si se deja vacía, el comercio simulado también simula el
# cobro y el front funciona sin levantarla — es el modo del despliegue público.
VITE_GATEWAY_URL=http://localhost:3000

# Backend del comercio. Solo se usa con VITE_USE_MOCKS=false.
# VITE_API_URL=https://api.ejemplo.com
```

Con `VITE_GATEWAY_URL` apuntando a snailpay-api, los depósitos y retiros se
cobran de verdad contra ella, con sus escenarios de rechazo. Los nombres de
titular y las CLABE de prueba están en el README de la pasarela.

Ten en cuenta que todo lo que lleve el prefijo `VITE_` se incrusta en el bundle
público: sirve para configurar, no para guardar secretos.

## Dónde vive el dato sensible

`merchant/vault.js` es el **único** módulo que guarda el número de tarjeta
completo y la CLABE. Existe porque la pasarela los necesita en cada cobro y no
emite tokens, así que alguien tiene que recordarlos; en un montaje real ese
alguien es el backend del comercio y el navegador no vería ese dato nunca.

Es un límite conocido y deliberado: deja el número en `localStorage`, legible por
cualquier XSS o por quien tenga el dispositivo. Desaparece el día que la pasarela
emita tokens.

**El CVV no se guarda en ningún sitio**, tampoco en la bóveda. Se pide en cada
depósito, viaja a la pasarela y muere ahí.
