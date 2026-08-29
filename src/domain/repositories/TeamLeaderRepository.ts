import type { Team } from '@/domain/entities/Team'
import type { TeamLeader } from '@/domain/entities/TeamLeader'

export interface TeamLeaderRepository {
  listForEvent(eventId: number): Promise<TeamLeader[]>
  add(eventId: number, team: Team, fullName: string): Promise<TeamLeader>
  update(teamLeaderId: number, fullName: string): Promise<TeamLeader>
  remove(teamLeaderId: number): Promise<void>
  setAttendance(teamLeaderId: number, dayId: number, attended: boolean): Promise<TeamLeader>
}
