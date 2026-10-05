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

Un cobro rechazado responde **también 201**, porque sigue siendo un pago: tiene
`id`, fecha y referencia, y por tanto se puede consultar y conciliar. Lo que
cambia es el estado.

```json
{
  "id": "pay_8f564df7e8",
  "status": "rejected",
  "status_detail": "cc_rejected_insufficient_amount",
  "transaction_amount": 500,
  "currency_id": "MXN",
  "date_created": "2026-10-05T03:42:11.108Z",
  "authorization_code": null,
  "reference": "a3f9c1e2-7b40-4d1e-9c22-5f8e1a0d3b67",
  "payer_id": "cc9577dc9fdd9691",
  "payer_email": "donovan@ejemplo.com"
}
```

`authorization_code` va `null` en todo rechazo: ese código lo emite el banco al
aprobar, así que si no aprobó no existe.

El 400 queda para lo que impide siquiera intentar el cobro — número que no pasa
Luhn, CVV con la longitud equivocada para la marca, moneda distinta de MXN. Un
rechazo no es un error de la petición.

### Escenarios de prueba

El resultado lo decide el **nombre del titular**, siguiendo la convención de
tarjetas de prueba de Mercado Pago. Coincide la primera palabra exacta: `FUND` y
`FUND LOPEZ` disparan, `FUNDACION` no. Cualquier nombre fuera de la tabla
aprueba.

| Titular | `status` | `status_detail` |
| ------- | -------- | --------------- |
| *cualquier otro*, `APRO` | `approved` | `accredited` |
| `FUND` | `rejected` | `cc_rejected_insufficient_amount` |
| `SECU` | `rejected` | `cc_rejected_bad_filled_security_code` |
| `EXPI` | `rejected` | `cc_rejected_bad_filled_date` |
| `FORM` | `rejected` | `cc_rejected_bad_filled_other` |
| `CALL` | `rejected` | `cc_rejected_call_for_authorize` |
| `DUPL` | `rejected` | `cc_rejected_duplicated_payment` |
| `MAXA` | `rejected` | `cc_rejected_max_attempts` |
| `OTHE` | `rejected` | `cc_rejected_other_reason` |
| `HIGH` | `rejected` | `cc_rejected_other_reason` ⚠️ |

`APRO`, `OTHE`, `CALL`, `FUND`, `SECU`, `EXPI` y `FORM` son los disparadores
reales de Mercado Pago. `HIGH`, `DUPL` y `MAXA` los añadimos aquí siguiendo el
mismo patrón; los `status_detail`, en cambio, son todos códigos reales.

**Por qué `HIGH` devuelve un motivo genérico.** Es el único caso enmascarado: la
respuesta dice `cc_rejected_other_reason` y el log del servidor registra
`cc_rejected_high_risk`. Copia lo que Stripe instruye para `lost_card` y
`stolen_card` — devolverlos como rechazo genérico para no avisar a quien pueda
ser el defraudador. El resto se dice tal cual, porque un motivo claro ayuda al
usuario honesto a corregir y lo que el atacante gana ahí lo frena el límite de
intentos, no el silencio.

El motivo real de **todos** los rechazos queda en el log, con el id del pago y
nada más:

```
[pay_8f564df7e8] rejected: cc_rejected_high_risk
```

Quien atienda soporte puede buscar por ese id lo que el usuario no llega a ver.

### Tarjetas para probar

Cualquiera de estas sirve: pasan Luhn, marca y longitud. El número no influye en
el resultado —lo decide el titular— pero necesitas uno distinto por cada tarjeta
que quieras tener guardada a la vez en el front, porque su regla de duplicados
compara marca, últimos 4 y vencimiento.

| Marca | Números |
| ----- | ------- |
| Visa | `4242424242424242` · `4012888888881881` · `4000056655665556` · `4111111111111111` |
| Mastercard | `5555555555554444` · `5105105105105100` · `2223003122003222` |
| American Express | `378282246310005` · `371449635398431` — CVV de **4** dígitos |

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

### Limitaciones conocidas

Las dos salen de lo mismo: el servicio no guarda nada.

**No hay idempotencia.** No recuerda qué referencias ya vio, así que dos
peticiones con la misma `reference` producen dos cobros. Un reintento por
timeout cobraría dos veces.

**No hay límite de intentos.** No recuerda cuántas veces se ha probado una
tarjeta, así que no puede frenar el *card testing* — mandar miles de números
robados para ver cuáles aprueban. Conviene decirlo porque es la defensa que de
verdad importa: ocultar motivos de rechazo apenas estorba a ese ataque, ya que
la señal que busca es `approved` contra `rejected`, y esa no se puede quitar.

En producción, además, el navegador no hablaría directo con la pasarela: habría
un backend de comercio en medio decidiendo qué reenviar. Esa capa, que aquí no
existe, es donde normalmente se filtra el detalle.

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
