import './globals.css'
import { Outfit } from 'next/font/google'
import { LanguageProvider } from "../context/LanguageContext";

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata = {
  title: 'Thrive Mobile',
  description: 'Thrive Educational App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body className={outfit.className}>
        <LanguageProvider>
          <div className="app-container">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
