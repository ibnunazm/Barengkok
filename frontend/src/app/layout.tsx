import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barengkok',
  description: 'Monitoring Penerangan Jalan Umum dan Air Toren Desa Barengkok',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-[#081220]'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
