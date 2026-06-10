import crypto from 'crypto'
import { getServerEnv } from '@/lib/env'

export interface PayFastSubscriptionParams {
  userId: string
  email: string
  name: string
  plan: 'monthly' | 'annual'
}

const PLANS = {
  monthly: { amount: '99.00', cycles: 0, frequency: 3, label: 'DriveLedger Monthly' },
  annual:  { amount: '899.00', cycles: 1, frequency: 6, label: 'DriveLedger Annual' },
}

export function buildCheckoutUrl(params: PayFastSubscriptionParams): string {
  const env  = getServerEnv()
  const host = env.pfSandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za'
  const plan = PLANS[params.plan]

  const data: Record<string, string> = {
    merchant_id:      env.pfMerchantId,
    merchant_key:     env.pfMerchantKey,
    return_url:       `${env.appUrl}/dashboard?payment=success`,
    cancel_url:       `${env.appUrl}/subscribe?payment=cancelled`,
    notify_url:       `${env.appUrl}/api/payfast/webhook`,
    name_first:       params.name.split(' ')[0] ?? params.name,
    name_last:        params.name.split(' ').slice(1).join(' ') || '-',
    email_address:    params.email,
    m_payment_id:     params.userId,
    amount:           plan.amount,
    item_name:        plan.label,
    subscription_type:'1',
    billing_date:     new Date().toISOString().slice(0, 10),
    recurring_amount: plan.amount,
    frequency:        String(plan.frequency),
    cycles:           String(plan.cycles),
  }

  data.signature = generateSignature(data, env.pfPassphrase)

  return `https://${host}/eng/process?${new URLSearchParams(data).toString()}`
}

export function generateSignature(data: Record<string, string>, passphrase: string): string {
  const ordered = Object.keys(data)
    .sort()
    .filter(k => k !== 'signature' && data[k] !== '')
    .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, '+')}`)
    .join('&')

  const withPass = passphrase
    ? `${ordered}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : ordered

  return crypto.createHash('md5').update(withPass).digest('hex')
}

export function verifyITN(body: Record<string, string>): boolean {
  const env      = getServerEnv()
  const received = body.signature
  const copy     = { ...body }
  delete copy.signature
  return received === generateSignature(copy, env.pfPassphrase)
}
