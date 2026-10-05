# snailpay-api

Servicio de SnailPay: autoriza recargas y retiros.

> Estado: en construcción. Expone la creación de pagos; los escenarios de
> rechazo todavía no están implementados.

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

## Endpoints

### `POST /payments`

Cobra a una tarjeta. Requiere `Authorization: Bearer <token>`.

```json
{
  "transaction_amount": 500,
  "currency_id": "MXN",
  "reference": "a3f9c1e2-7b40-4d1e-9c22-5f8e1a0d3b67",
  "payer_email": "donovan@ejemplo.com",
  "card": {
    "number": "4242424242424242",
    "expiration_month": 12,
    "expiration_year": 2028,
    "security_code": "123",
    "cardholder_name": "Donovan Rodriguez"
  }
}
```

Respuesta `201`:

```json
{
  "id": "pay_e95033de5e",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 500,
  "currency_id": "MXN",
  "date_created": "2026-10-05T02:45:32.820Z",
  "authorization_code": "FJFWG3",
  "reference": "a3f9c1e2-7b40-4d1e-9c22-5f8e1a0d3b67",
  "payer_id": "cc9577dc9fdd9691",
  "payer_email": "donovan@ejemplo.com"
}
```

Notas del contrato:

- `reference` es el identificador de la operación **en el comercio**, y se
  devuelve tal cual para que el comercio pueda conciliar. Es obligatorio.
- `currency_id` solo admite `MXN`: una pasarela que dijera aceptar monedas que
  no puede liquidar estaría mintiendo. Va también en la respuesta porque un
  recibo tiene que sostenerse solo.
- `payer_id` se deriva del correo, no se almacena: el mismo pagador obtiene
  siempre el mismo id sin que el servicio recuerde nada. No es anonimización.
- `security_code` son 3 dígitos, o 4 si la marca es American Express.
- Por ahora siempre aprueba. Los rechazos vendrán después.

**Limitación conocida: no hay idempotencia.** Sin almacenamiento, el servicio no
recuerda qué referencias ya vio, así que dos peticiones con la misma `reference`
producen dos cobros. Un reintento por timeout cobraría dos veces.

## Qué es y qué no es

Simula una **pasarela de pagos**, no el libro de cuentas. El saldo y el
historial de movimientos los lleva el frontend en `localStorage`; este servicio
recibe una orden, decide si la autoriza y devuelve un comprobante. Por eso no
comprueba si hay fondos suficientes: ese dato no lo tiene ni le corresponde.

Los datos de la tarjeta no se almacenan, no se registran en ningún log y no
salen en la respuesta ni enmascarados: mueren en el servicio que los valida.

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
