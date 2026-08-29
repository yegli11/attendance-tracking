import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'
import type { Team } from '@/domain/entities/Team'
import type { TeamLeader } from '@/domain/entities/TeamLeader'

export function addTeamLeader(
  repository: TeamLeaderRepository,
  eventId: number,
  team: Team,
  fullName: string,
): Promise<TeamLeader> {
  return repository.add(eventId, team, fullName.trim())
}
