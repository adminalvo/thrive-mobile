import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"], // latin-ext provides native Azerbaijani Ə/ə support
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thrive CRM - Future of Education",
  description: "Premium CRM for Thrive Education Center.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Thrive CRM"
  }
};

export const viewport = {
  themeColor: "#0f172a",
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
    <div className={inter.variable} style={{ minHeight: "100vh" }}>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster position="top-right" />
          </NextIntlClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
