export interface Registration {
  id: number
  personId: number
  eventId: number
  attended: boolean
  attendedDate: string | null
  code: string
  createdAt: string
}
