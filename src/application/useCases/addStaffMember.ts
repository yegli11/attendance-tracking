import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'
import type { StaffMember } from '@/domain/entities/StaffMember'

export function addStaffMember(
  repository: StaffMemberRepository,
  eventId: number,
  fullName: string,
): Promise<StaffMember> {
  return repository.add(eventId, fullName.trim())
}
