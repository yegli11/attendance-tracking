import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'

export function removeStaffMember(repository: StaffMemberRepository, staffMemberId: number): Promise<void> {
  return repository.remove(staffMemberId)
}
