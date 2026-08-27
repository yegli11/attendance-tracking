import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'
import type { TeamLeader } from '@/domain/entities/TeamLeader'

export function listTeamLeaders(repository: TeamLeaderRepository, eventId: number): Promise<TeamLeader[]> {
  return repository.listForEvent(eventId)
}
