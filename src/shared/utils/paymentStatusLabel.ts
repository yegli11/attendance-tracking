import type { PaymentStatus } from '@/domain/entities/PaymentStatus'

const LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  financiado: 'Financiado',
  pagado: 'Pagado',
}

export function paymentStatusLabel(status: PaymentStatus | null): string {
  return status ? LABELS[status] : ''
}
