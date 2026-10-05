// Estado operativo de la pasarela.
//
// Es un flag en memoria, no un dato de negocio: configuración que decide si el
// servicio acepta cobros ahora mismo. Por eso no contradice que la pasarela no
// guarde nada.
//
// Se reinicia con el proceso a propósito. Dejar la pasarela apagada para siempre
// por un olvido es peor que tener que volver a apagarla tras un despliegue.

export type ServiceStatus = 'operational' | 'major_outage'

let current: ServiceStatus = 'operational'

export function getStatus(): ServiceStatus {
  return current
}

export function setStatus(status: ServiceStatus): ServiceStatus {
  current = status
  return current
}

export function isOperational(): boolean {
  return current === 'operational'
}
