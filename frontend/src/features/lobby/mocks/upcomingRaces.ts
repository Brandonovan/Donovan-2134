// Mock de GET /races/upcoming: las 6 carreras de mañana.
import type { UpcomingRace } from '../types'
export const UPCOMING_RACES: UpcomingRace[] = [
  {
    id: 1,
    name: 'Carrera de la Hoja',
    trophy: 'hoja',
    startsAt: '2026-09-29T10:00:00',
    participants: 6,
    location: { city: 'Ciudad de México', venue: 'Tlalpan' },
  },
  {
    id: 2,
    name: 'Sprint del Huerto',
    trophy: 'huerto',
    startsAt: '2026-09-29T12:00:00',
    participants: 6,
    location: { city: 'Guadalajara', venue: 'Chapultepec' },
  },
  {
    id: 3,
    name: 'Copa Lechuga',
    trophy: 'lechuga',
    startsAt: '2026-09-29T14:00:00',
    participants: 6,
    location: { city: 'Monterrey', venue: 'San Pedro' },
  },
  {
    id: 4,
    name: 'Gran Premio del Jardín',
    trophy: 'arce',
    startsAt: '2026-09-29T16:00:00',
    participants: 6,
    location: { city: 'Puebla', venue: 'Cholula' },
  },
  {
    id: 5,
    name: 'Carrera del Musgo',
    trophy: 'musgo',
    startsAt: '2026-09-29T18:00:00',
    participants: 6,
    location: { city: 'Querétaro', venue: 'Juriquilla' },
  },
  {
    id: 6,
    name: 'Clásico del Rocío',
    trophy: 'rocio',
    startsAt: '2026-09-29T20:00:00',
    participants: 6,
    location: { city: 'Mérida', venue: 'Montejo' },
  },
]
