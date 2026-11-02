import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ontwikkelingsfasen in een projectgroep",
  description: "Groepsapp voor individuele input, dashboard, groepskeuzes en actieplan."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
