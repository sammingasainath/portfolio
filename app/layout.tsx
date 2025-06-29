import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Samminga Sainath Rao - Fullstack Developer & Technical Architect',
  description: 'Passionate technologist with expertise in fullstack development, AI/ML, and product management. Co-founder of Sambin Technologies with experience in scaling technical architectures and leading development teams.',
  keywords: [
    'Samminga Sainath Rao',
    'Fullstack Developer',
    'Technical Architect',
    'AI/ML Engineer',
    'Flutter Developer',
    'React Developer',
    'Product Manager',
    'RGIPT',
    'Sambin Technologies',
    'NASSCOM',
    'Portfolio'
  ],
  authors: [{ name: 'Samminga Sainath Rao' }],
  creator: 'Samminga Sainath Rao',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://samminga-portfolio.vercel.app',
    title: 'Samminga Sainath Rao - Fullstack Developer & Technical Architect',
    description: 'Passionate technologist with expertise in fullstack development, AI/ML, and product management.',
    siteName: 'Samminga Sainath Rao Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samminga Sainath Rao - Fullstack Developer & Technical Architect',
    description: 'Passionate technologist with expertise in fullstack development, AI/ML, and product management.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 