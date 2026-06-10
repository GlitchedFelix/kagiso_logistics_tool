import crypto from 'crypto'

export interface PayFastConfig {
  merchantId: string
  merchantKey: string
  passphrase: string
  sandbox: boolean
}

export interface PayFastSubscriptionParams {
  userId: string
  email: string
  name: string
  plan: 'monthly' | 'annual'
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
}

const PLANS = {
  monthly: { amount: '99.00', cycles: 0, frequency: 3, label: 'DriveLedger Monthly' },
  annual:  { amount: '899.00', cycles: 1, frequency: 6, label: 'DriveLedger Annual' },
}

export function getConfig(): PayFastConfig {
  return {
    merchantId:  process.env.PAYFAST_MERCHANT_ID!,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
    passphrase:  process.env.PAYFAST_PASSPHRASE ?? '',
    sandbox:     process.env.PAYFAST_SANDBOX === 'true',
  }
}

export function buildCheckoutUrl(params: PayFastSubscriptionParams): string {
  const cfg = getConfig()
  const plan = PLANS[params.plan]
  const host = cfg.sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za'

  const data: Record<string, string> = {
    merchant_id:         cfg.merchantId,
    merchant_key:        cfg.merchantKey,
    return_url:          params.returnUrl,
    cancel_url:          params.cancelUrl,
    notify_url:          params.notifyUrl,
    name_first:          params.name.split(' ')[0] ?? params.name,
    name_last:           params.name.split(' ').slice(1).join(' ') || '-',
    email_address:       params.email,
    m_payment_id:        params.userId,
    amount:              plan.amount,
    item_name:           plan.label,
    subscription_type:   '1',
    billing_date:        new Date().toISOString().slice(0, 10),
    recurring_amount:    plan.amount,
    frequency:           String(plan.frequency),
    cycles:              String(plan.cycles),
  }

  const signature = generateSignature(data, cfg.passphrase)
  data.signature = signature

  const qs = new URLSearchParams(data).toString()
  return `https://${host}/eng/process?${qs}`
}

export function generateSignature(data: Record<string, string>, passphrase: string): string {
  const ordered = Object.keys(data)
    .sort()
    .filter(k => k !== 'signature' && data[k] !== '')
    .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, '+')}`)
    .join('&')

  const withPass = passphrase ? `${ordered}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : ordered
  return crypto.createHash('md5').update(withPass).digest('hex')
}

export function verifyITN(body: Record<string, string>): boolean {
  const cfg = getConfig()
  const received = body.signature
  const dataCopy = { ...body }
  delete dataCopy.signature
  const expected = generateSignature(dataCopy, cfg.passphrase)
  return received === expected
}
