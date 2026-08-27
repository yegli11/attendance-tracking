import type { StaffMember } from '@/domain/entities/StaffMember'

export interface StaffMemberRepository {
  listForEvent(eventId: number): Promise<StaffMember[]>
  add(eventId: number, fullName: string): Promise<StaffMember>
  update(staffMemberId: number, fullName: string): Promise<StaffMember>
  remove(staffMemberId: number): Promise<void>
  setAttendance(staffMemberId: number, dayId: number, attended: boolean): Promise<StaffMember>
}
