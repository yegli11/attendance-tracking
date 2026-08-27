import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'
import type { TeamLeader } from '@/domain/entities/TeamLeader'

export function updateTeamLeader(
  repository: TeamLeaderRepository,
  teamLeaderId: number,
  fullName: string,
): Promise<TeamLeader> {
  return repository.update(teamLeaderId, fullName.trim())
}
