import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'
import type { StaffMember } from '@/domain/entities/StaffMember'

export function listStaffMembers(repository: StaffMemberRepository, eventId: number): Promise<StaffMember[]> {
  return repository.listForEvent(eventId)
}
