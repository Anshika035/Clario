import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const sans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Clario",
    template: "%s · Clario",
  },
  description:
    "AI assists. Seniors advise. You decide. A student platform for judging internships, hackathons, and other campus opportunities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try { var theme = localStorage.getItem('vibethon-theme'); if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); } catch (e) {}",
          }}
        />
      </head>
      <body className="min-h-full bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
