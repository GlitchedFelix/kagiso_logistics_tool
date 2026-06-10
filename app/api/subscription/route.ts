import { NextResponse } from 'next/server'
import { buildCheckoutUrl } from '@/lib/payfast'

export async function POST(request: Request) {
  try {
    const { plan, email, name, userId } = await request.json()

    if (!plan || !email || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutUrl = buildCheckoutUrl({
      userId,
      email,
      name: name || email,
      plan,
      returnUrl:  `${appUrl}/dashboard?payment=success`,
      cancelUrl:  `${appUrl}/subscribe?payment=cancelled`,
      notifyUrl:  `${appUrl}/api/payfast/webhook`,
    })

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('Subscription route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
