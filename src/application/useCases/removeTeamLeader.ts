import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'

export function removeTeamLeader(repository: TeamLeaderRepository, teamLeaderId: number): Promise<void> {
  return repository.remove(teamLeaderId)
}
