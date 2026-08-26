import type { Team } from '@/domain/entities/Team'

const LABELS: Record<Team, string> = {
  naranja: 'Naranja',
  rojo: 'Rojo',
  verde: 'Verde',
  azul: 'Azul',
}

export function teamLabel(team: Team | null): string {
  return team ? LABELS[team] : ''
}

const COLORS: Record<Team, { bg: string; color: string }> = {
  naranja: { bg: '#F5A524', color: '#3D2600' },
  rojo: { bg: '#E5484D', color: 'common.white' },
  verde: { bg: '#30A46C', color: 'common.white' },
  azul: { bg: '#0091FF', color: 'common.white' },
}

export function teamColor(team: Team): { bg: string; color: string } {
  return COLORS[team]
}
