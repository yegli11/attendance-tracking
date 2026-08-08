import type { Gender } from '@/domain/entities/Gender'

export interface GenderRepository {
  listGenders(): Promise<Gender[]>
}
