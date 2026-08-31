import type { Dayjs } from 'dayjs'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

export type BirthInputMode = 'birthdate' | 'age'

interface Props {
  mode: BirthInputMode
  onModeChange: (mode: BirthInputMode) => void
  birthdate: Dayjs | null
  onBirthdateChange: (value: Dayjs | null) => void
  ageYears: string
  onAgeYearsChange: (value: string) => void
}

// Some registrations only have an age, not an exact birthdate (e.g. records
// migrated from paper sheets). Lets staff pick either input instead of forcing
// a date.
export function BirthdateOrAgeField({
  mode,
  onModeChange,
  birthdate,
  onBirthdateChange,
  ageYears,
  onAgeYearsChange,
}: Props) {
  return (
    <Stack spacing={1}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, value: BirthInputMode | null) => value !== null && onModeChange(value)}
      >
        <ToggleButton value="birthdate">Fecha de nacimiento</ToggleButton>
        <ToggleButton value="age">Edad</ToggleButton>
      </ToggleButtonGroup>

      {mode === 'birthdate' ? (
        <DatePicker
          label="Fecha de nacimiento"
          value={birthdate}
          onChange={onBirthdateChange}
          disableFuture
          slotProps={{ textField: { fullWidth: true, slotProps: { inputLabel: { shrink: true } } } }}
        />
      ) : (
        <Box>
          <TextField
            label="Edad (años)"
            type="number"
            value={ageYears}
            onChange={(e) => onAgeYearsChange(e.target.value)}
            slotProps={{ htmlInput: { min: 0, max: 120 } }}
            fullWidth
          />
        </Box>
      )}
    </Stack>
  )
}
