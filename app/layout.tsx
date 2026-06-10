import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'DriveLedger — Rideshare Earnings Tracker',
  description: 'Track your Uber & Bolt earnings, expenses, and performance.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#18222f',
              border: '1px solid #e6eaf0',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
