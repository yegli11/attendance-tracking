import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'
import type { StaffMember } from '@/domain/entities/StaffMember'

export function markStaffAttendance(
  repository: StaffMemberRepository,
  staffMemberId: number,
  dayId: number,
  attended: boolean,
): Promise<StaffMember> {
  return repository.setAttendance(staffMemberId, dayId, attended)
}
