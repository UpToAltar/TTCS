export type CreateInvoiceType = {
  appointmentId: string
  total: number | null
  status: string
  note: string
}

export type UpdateInvoiceType = {
  total: number | null
  status: string
  note: string
}