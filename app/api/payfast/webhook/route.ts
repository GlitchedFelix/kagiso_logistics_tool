import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyITN } from '@/lib/payfast'
import { getSupabaseEnv } from '@/lib/env'

export async function POST(request: Request) {
  try {
    const text = await request.text()
    const body = Object.fromEntries(new URLSearchParams(text))

    if (!verifyITN(body)) {
      console.error('PayFast ITN: signature mismatch')
      return new NextResponse('Invalid signature', { status: 400 })
    }

    const userId        = body.m_payment_id
    const paymentStatus = body.payment_status
    const paymentId     = body.pf_payment_id
    const token         = body.token

    if (!userId) {
      return new NextResponse('Missing user ID', { status: 400 })
    }

    const amount      = parseFloat(body.amount_gross || '0')
    const plan        = amount >= 800 ? 'annual' : 'monthly'
    const amountCents = Math.round(amount * 100)

    // Service role key bypasses RLS — only used inside this server-side webhook
    const { url, serviceKey } = getSupabaseEnv()
    const supabase = createClient(url, serviceKey)

    if (paymentStatus === 'COMPLETE') {
      const now       = new Date()
      const periodEnd = plan === 'annual'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      await supabase.from('subscriptions').upsert({
        user_id:              userId,
        status:               'active',
        plan,
        amount_cents:         amountCents,
        payfast_token:        token || null,
        payfast_payment_id:   paymentId || null,
        trial_ends_at:        null,
        current_period_start: now.toISOString(),
        current_period_end:   periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at:           now.toISOString(),
      }, { onConflict: 'user_id' })
    }

    if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }

    console.log('PayFast ITN processed:', { userId, paymentStatus, plan })
    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('PayFast webhook error:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
