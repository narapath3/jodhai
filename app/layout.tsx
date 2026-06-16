import type { Metadata } from "next";
import { Sarabun, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const sarabun = Sarabun({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meeting-to-Action · Thai Transcript Summarizer",
  description: "เปลี่ยน transcript ประชุมภาษาไทยให้กลายเป็น action items + assignee + deadline โดยอัตโนมัติ ไม่ต้องจด ไม่ต้องสรุปเอง",
  keywords: ["meeting", "action items", "AI", "ประชุม", "สรุปประชุม", "ภาษาไทย"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#0F1117] text-[#E4E8F5]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-10 w-full max-w-[720px] mx-auto pt-8 px-4 pb-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
