export type CreateRecordType = {
  doctorId: string
  diagnosis: string
  prescription: string
  notes: string
  medicalAppointmentId: string
}

export type UpdateRecordType = {
  diagnosis: string
  prescription: string
  notes: string
}
