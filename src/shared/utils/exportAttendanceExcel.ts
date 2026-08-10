import writeExcelFile, { type Column } from 'write-excel-file/browser'
import type { Event } from '@/domain/entities/Event'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { ageLabel } from '@/shared/utils/calculateAge'

function header(text: string) {
  return { value: text, fontWeight: 'bold' as const }
}

function formatAttendedAt(attendedAt: string | null): string {
  if (!attendedAt) return ''
  return new Date(attendedAt).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildColumns(event: Event): Column<RosterEntry>[] {
  const dayColumns: Column<RosterEntry>[] = event.days.map((day) => ({
    header: header(event.days.length > 1 ? `Día ${day.dayNumber}` : 'Hora de ingreso'),
    cell: (entry) => ({
      value: formatAttendedAt(entry.attendance.find((a) => a.eventDayId === day.id)?.attendedAt ?? null),
    }),
    width: 20,
  }))

  return [
    { header: header('Codigo'), cell: (entry) => ({ value: entry.code }), width: 12 },
    { header: header('Nombre'), cell: (entry) => ({ value: entry.firstName }), width: 20 },
    { header: header('Apellido'), cell: (entry) => ({ value: entry.lastName }), width: 20 },
    { header: header('Edad'), cell: (entry) => ({ value: ageLabel(entry.birthdate) }), width: 12 },
    { header: header('Genero'), cell: (entry) => ({ value: entry.genderName }), width: 14 },
    { header: header('Telefono'), cell: (entry) => ({ value: entry.phoneNumber }), width: 16 },
    {
      header: header('Representante'),
      cell: (entry) => ({ value: entry.representativeName ?? '' }),
      width: 22,
    },
    ...dayColumns,
  ]
}

function sanitizeFileNamePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function exportAttendanceExcel(event: Event, roster: RosterEntry[]): Promise<void> {
  const attendees = roster.filter((entry) => entry.attendance.some((day) => day.attendedAt !== null))
  const fileName = `asistencia-${sanitizeFileNamePart(event.name)}.xlsx`
  await writeExcelFile(attendees, { columns: buildColumns(event) }).toFile(fileName)
}
