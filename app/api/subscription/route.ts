import { NextResponse } from 'next/server'
import { buildCheckoutUrl } from '@/lib/payfast'

export async function POST(request: Request) {
  try {
    const { plan, email, name, userId } = await request.json()

    if (!plan || !email || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const checkoutUrl = buildCheckoutUrl({ plan, email, name: name || email, userId })
    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('Subscription route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
