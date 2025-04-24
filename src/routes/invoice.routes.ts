import { Router } from 'express'
import { InvoiceController } from '~/controllers/invoice.controller'
import { authentication, isAdmin, isAdminOrDoctor } from '~/middlewares/auth.middleware'
import { validateAddInvoice, validateUpdateInvoice } from '~/middlewares/invoice.validation'
import { handleValidationErrors } from '~/middlewares/validation'

const router = Router()
router.post(
  '/add',
  authentication,
  isAdminOrDoctor,
  validateAddInvoice(),
  handleValidationErrors,
  InvoiceController.addInvoice
)
router.get('/', authentication, isAdminOrDoctor, InvoiceController.getAllInvoices)
router.get('/:id', authentication, isAdminOrDoctor, InvoiceController.getInvoiceById)
router.get('/invoice_detail/:id', authentication, isAdminOrDoctor, InvoiceController.getInvoicePDFById)
router.put(
  '/update/:id',
  authentication,
  isAdminOrDoctor,
  validateUpdateInvoice(),
  handleValidationErrors,
  InvoiceController.updateInvoice
)
router.delete('/delete/:id', authentication, isAdminOrDoctor, InvoiceController.deleteInvoice)

export default router
