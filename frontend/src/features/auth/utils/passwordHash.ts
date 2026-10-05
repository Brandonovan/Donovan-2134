// Hash de contraseñas para la simulación local.
//
// Reproduce lo que haría el backend: PBKDF2-HMAC-SHA256 con un salt aleatorio
// por usuario. Se usa Web Crypto porque es nativo del navegador; en un backend
// real la elección sería Argon2id, que aquí exigiría una dependencia WebAssembly.
//
// Hacer esto en el front NO aporta seguridad real: quien pueda leer localStorage
// también puede leer este archivo. Lo que consigue es que el dato almacenado
// tenga la misma forma que tendría en una base de datos, de modo que migrar al
// backend sea borrar este archivo y nada más.
//
// crypto.subtle solo existe en contextos seguros (https y localhost).

const ALGORITHM = 'pbkdf2-sha256'
const ITERATIONS = 600_000 // Mínimo recomendado por OWASP para PBKDF2-HMAC-SHA256.
const SALT_BYTES = 16
const KEY_BITS = 256

const encoder = new TextEncoder()

function toBase64(bytes: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function randomSalt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES))
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    KEY_BITS,
  )
  return new Uint8Array(bits)
}

// Comparación en tiempo constante: salir en la primera diferencia revelaría,
// por el tiempo de respuesta, cuántos bytes acertó quien lo intenta.
function equals(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}

// Formato autodescriptivo, inspirado en el de bcrypt y argon2:
//   pbkdf2-sha256$600000$<salt>$<hash>
// Guardar los parámetros junto al hash permite subir las iteraciones más
// adelante sin invalidar las contraseñas ya registradas.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt()
  const hash = await derive(password, salt, ITERATIONS)
  return `${ALGORITHM}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPassword(password: string, stored: unknown): Promise<boolean> {
  const parts = String(stored ?? '').split('$')
  if (parts.length !== 4) return false

  const [algorithm, rawIterations, salt, hash] = parts as [string, string, string, string]
  const iterations = Number(rawIterations)
  if (algorithm !== ALGORITHM || !Number.isInteger(iterations) || iterations <= 0) return false

  return equals(await derive(password, fromBase64(salt), iterations), fromBase64(hash))
}

// Deriva un hash que se descarta. Sirve para que un intento contra un correo
// inexistente cueste lo mismo que uno contra un correo real (ver authService).
export async function dummyVerify(password: string): Promise<false> {
  await derive(password, randomSalt(), ITERATIONS)
  return false
}
