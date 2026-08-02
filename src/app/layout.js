import './globals.css'
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: 'Thrive Mobile',
  description: 'Education Tracking App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body>
        <LanguageProvider>
          <div className="app-container">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
