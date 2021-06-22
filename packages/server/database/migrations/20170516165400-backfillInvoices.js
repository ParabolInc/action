import stripe from '../../billing/stripe'

const fetchAllInvoices = async () => {
  const stripeInvoices = []
  const options = {limit: 100}

  for (let i = 0; i < 100; i++) {
    if (i > 0) {
      options.starting_after = stripeInvoices[stripeInvoices.length - 1].id
    }
    const invoiceLines = await stripe.invoices.list(options) // eslint-disable-line no-await-in-loop
    stripeInvoices.push(...invoiceLines.data)
    if (!invoiceLines.has_more) break
  }
  return stripeInvoices
}

exports.up = async (r) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('NODE_ENV is testing or devving. Not backfilling invoices')
    return
  }

  // invoiceCreated has been refactored so this migration won't work anymore, which is great. it served its purpose
  try {
    const handleInvoiceCreated = require('../../billing/handlers/invoiceCreated').default
    const stripeInvoices = await fetchAllInvoices()
    const invoiceIdsInDB = await r
      .table('Invoice')('id')
      .run()
    const invoicesToHandle = stripeInvoices.filter((invoice) => !invoiceIdsInDB.includes(invoice.id))
    for (let i = 0; i < invoicesToHandle.length; i++) {
      const invoice = invoicesToHandle[i]
      await handleInvoiceCreated(invoice.id) // eslint-disable-line no-await-in-loop
    }
  } catch (e) {
    // noop
  }
}

exports.down = async () => {
  // noop
}
