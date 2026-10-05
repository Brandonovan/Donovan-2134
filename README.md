# SnailWin

Página de apuestas de carreras de caracoles. Prueba técnica.

El repositorio contiene las dos partes del proyecto:

```
.
├── frontend/   React + Vite (ver frontend/README.md)
└── backend/    pendiente
```

## Despliegue

- **Frontend:** _(pendiente de enlace)_

## Cómo ejecutarlo

Requiere Node.js `^20.19` o `>=22.12` (lo que exige Vite 8).

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Sobre la simulación

El registro, el inicio de sesión y la billetera de SnailPay funcionan **sin
backend**: los datos viven en el `localStorage` del navegador. Dos consecuencias
al probar la versión desplegada:

- Cada visitante tiene sus propios datos. Las cuentas no se comparten entre
  navegadores ni entre personas.
- Una cuenta nueva empieza con saldo cero y sin movimientos. El saldo solo sube
  recargando desde SnailPay.

Los servicios están escritos con la forma que tendrán contra la API real
(`if (!USE_MOCKS) return apiClient(...)`), de modo que conectar el backend sea
cambiar dos variables de entorno y no reescribir las pantallas.

## Tratamiento de la contraseña

La contraseña nunca se almacena. Se guarda solo su hash con PBKDF2-SHA256,
600.000 iteraciones y un salt aleatorio por usuario, en el mismo formato que
usaría una base de datos:

```
pbkdf2-sha256$600000$<salt>$<hash>
```

Hacerlo en el navegador **no protege la aplicación**: quien pueda editar
`localStorage` puede saltarse el inicio de sesión sin tocar el hash. Lo que evita
es exponer en claro una contraseña que la persona probablemente reutiliza en
otros servicios, y deja el dato con la forma exacta que tendrá en el servidor.

El detalle está en [`frontend/README.md`](frontend/README.md).
