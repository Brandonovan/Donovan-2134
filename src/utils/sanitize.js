// Caracteres de control (C0/C1) y caracteres invisibles de ancho cero.
// Se usan para ocultar contenido o romper parsers, y nunca son válidos en un formulario.
// oxlint-disable-next-line no-control-regex -- se buscan a propósito para eliminarlos
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/g

export function hasControlChars(value) {
  return new RegExp(CONTROL_CHARS_REGEX.source).test(value)
}

export function stripControlChars(value) {
  return value.replace(CONTROL_CHARS_REGEX, '')
}

// Texto libre de una línea: normaliza Unicode, quita caracteres de control,
// colapsa espacios repetidos y recorta los extremos.
export function sanitizeText(value) {
  return stripControlChars(String(value ?? '').normalize('NFC'))
    .replace(/\s+/g, ' ')
    .trim()
}

// Correo: sin espacios en ninguna parte y en minúsculas.
export function sanitizeEmail(value) {
  return sanitizeText(value).replace(/\s/g, '').toLowerCase()
}
