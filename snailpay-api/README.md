# snailpay-api

Servicio de SnailPay: autoriza recargas y retiros.

> Estado: esqueleto. Arranca y responde, pero todavía no expone endpoints de
> negocio.

## Requisitos

- Node.js `^20.19` o `>=22.12`

## Uso

```bash
npm install
cp .env.example .env     # opcional: los valores por defecto sirven en local
npm run dev              # http://localhost:3000, recarga al guardar
npm run typecheck        # comprueba tipos sin compilar
npm run build            # compila a dist/
npm start                # ejecuta lo compilado
```

Comprobación rápida:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## Qué es y qué no es

Simula una **pasarela de pagos**, no el libro de cuentas. El saldo y el
historial de movimientos los lleva el frontend en `localStorage`; este servicio
recibe una orden, decide si la autoriza y devuelve un comprobante. Por eso no
comprueba si hay fondos suficientes: ese dato no lo tiene ni le corresponde.

Tampoco emite los tokens de sesión. `middlewares/authenticate.ts` exige una
cabecera `Authorization: Bearer` con el formato que genera el front, pero **no
verifica nada**: sin emisor ni almacén de sesiones, comprueba la forma, no que
alguien se haya autenticado.

## Estructura

```
src/
├── server.ts          arranca el listener
├── app.ts             monta Express, middlewares y rutas — sin escuchar
├── config/
│   └── env.ts         lee y valida las variables al arrancar
├── middlewares/
│   ├── authenticate.ts  exige Bearer (ver límite arriba)
│   ├── validate.ts      valida el cuerpo contra un esquema de zod
│   ├── notFound.ts      404 de rutas inexistentes
│   └── errorHandler.ts  único sitio que traduce error → respuesta HTTP
└── shared/
    ├── AppError.ts    errores que ya llevan su status HTTP
    └── money.ts       aritmética en centavos
```

`app.ts` se separa de `server.ts` para que los tests puedan importar la app y
hacerle peticiones sin ocupar un puerto.

`authenticate.ts` y `validate.ts` todavía no los usa nadie: están listos para el
primer módulo que se monte.

## Variables de entorno

| Variable      | Por defecto             | Para qué                                  |
| ------------- | ----------------------- | ----------------------------------------- |
| `PORT`        | `3000`                  | Puerto de escucha                         |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen del frontend autorizado a llamar   |
| `NODE_ENV`    | `development`           | En `development` los errores 500 detallan |

Se validan al arrancar: si alguna viene mal, el proceso termina con el motivo.
