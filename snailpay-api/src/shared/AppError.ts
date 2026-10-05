// Error que ya sabe con qué status debe responderse. Permite que los servicios
// lancen errores de negocio sin importar Express ni saber nada de HTTP: la
// traducción a respuesta ocurre en un solo sitio (middlewares/errorHandler).
export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details)
  }

  static unauthorized(message = 'No autorizado') {
    return new AppError(401, message)
  }

  static notFound(message = 'No encontrado') {
    return new AppError(404, message)
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(422, message, details)
  }
}
