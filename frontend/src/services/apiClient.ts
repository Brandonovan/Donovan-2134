const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'snailwin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// `body` se serializa a JSON, así que es cualquier cosa serializable.
type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

// El tipo de la respuesta lo decide quien llama: el cliente no puede saberlo y
// fingir que sí sería mentir. `apiClient<Wallet>('/wallet')` deja esa promesa
// escrita en el sitio donde se conoce el contrato.
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const token = getToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    const error: { message?: string } = await response.json().catch(() => ({}))
    throw new Error(error.message ?? `Error ${response.status}`)
  }

  return response.status === 204 ? (null as T) : ((await response.json()) as T)
}
