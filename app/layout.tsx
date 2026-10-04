import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Samminga Sainath Rao - Software Engineer | Voice & Agentic AI Builder',
  description: 'Software engineer building voice and agentic AI systems and shipping products from idea to launch. Former co-founder of Sambin Technologies (NASSCOM Foundation funded, IIIT Bangalore incubated) and Smart India Hackathon 2024 winner.',
  keywords: [
    'Samminga Sainath Rao',
    'Fullstack Developer',
    'Software Engineer',
    'Voice AI',
    'Agentic AI',
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
    url: 'https://sai.fhaida.com',
    title: 'Samminga Sainath Rao - Software Engineer | Voice & Agentic AI Builder',
    description: 'Software engineer building voice and agentic AI systems and shipping products from idea to launch.',
    siteName: 'Samminga Sainath Rao Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samminga Sainath Rao - Software Engineer | Voice & Agentic AI Builder',
    description: 'Software engineer building voice and agentic AI systems and shipping products from idea to launch.',
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