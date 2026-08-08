export interface Age {
  years: number
  months: number
}

export function calculateAge(birthdate: string): Age {
  const birth = new Date(`${birthdate}T00:00:00`)
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  if (today.getDate() < birth.getDate()) months--
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months }
}

export function ageLabel(birthdate: string): string {
  const { years, months } = calculateAge(birthdate)
  if (years < 1) {
    const m = Math.max(months, 0)
    return `${m} ${m === 1 ? 'mes' : 'meses'}`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}
