import copaArce from '@/assets/trophies/copa-arce.png'
import type { TrophyId } from '../types'
import copaHoja from '@/assets/trophies/copa-hoja.png'
import copaHuerto from '@/assets/trophies/copa-huerto.png'
import copaLechuga from '@/assets/trophies/copa-lechuga.png'
import copaMusgo from '@/assets/trophies/copa-musgo.png'
import copaRocio from '@/assets/trophies/copa-rocio.png'

export const TROPHIES: Record<TrophyId, { src: string; name: string }> = {
  hoja: { src: copaHoja, name: 'Copa de la Hoja' },
  arce: { src: copaArce, name: 'Copa del Jardín' },
  lechuga: { src: copaLechuga, name: 'Copa Lechuga' },
  rocio: { src: copaRocio, name: 'Copa del Rocío' },
  huerto: { src: copaHuerto, name: 'Copa del Huerto' },
  musgo: { src: copaMusgo, name: 'Copa del Musgo' },
}
