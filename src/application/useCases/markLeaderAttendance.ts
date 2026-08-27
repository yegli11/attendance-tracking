import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'
import type { TeamLeader } from '@/domain/entities/TeamLeader'

export function markLeaderAttendance(
  repository: TeamLeaderRepository,
  teamLeaderId: number,
  dayId: number,
  attended: boolean,
): Promise<TeamLeader> {
  return repository.setAttendance(teamLeaderId, dayId, attended)
}
