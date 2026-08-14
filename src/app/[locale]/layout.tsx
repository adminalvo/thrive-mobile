import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'react-hot-toast';
import "../globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Thrive CRM - Future of Education",
  description: "Premium CRM for Thrive Education Center.",
};

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={poppins.variable}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
