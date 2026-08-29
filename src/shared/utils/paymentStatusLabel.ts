import type { PaymentStatus } from '@/domain/entities/PaymentStatus'

const LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  financiado: 'Financiado',
  pagado: 'Pagado',
}

export function paymentStatusLabel(status: PaymentStatus | null): string {
  return status ? LABELS[status] : ''
}

const COLORS: Record<PaymentStatus, { bg: string; color: string }> = {
  pagado: { bg: 'success.main', color: 'common.white' },
  financiado: { bg: 'info.main', color: 'common.white' },
  pendiente: { bg: 'warning.main', color: 'common.white' },
}

export function paymentStatusColor(status: PaymentStatus): { bg: string; color: string } {
  return COLORS[status]
}
