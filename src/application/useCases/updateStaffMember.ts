import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'
import type { StaffMember } from '@/domain/entities/StaffMember'

export function updateStaffMember(
  repository: StaffMemberRepository,
  staffMemberId: number,
  fullName: string,
): Promise<StaffMember> {
  return repository.update(staffMemberId, fullName.trim())
}
