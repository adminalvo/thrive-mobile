import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Thrive Mobile',
  description: 'Thrive Educational App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body className={inter.className}>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
