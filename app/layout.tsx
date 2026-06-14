import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "จดให้ — AI สรุปประชุม",
  description: "เปลี่ยน transcript ประชุมภาษาไทยให้กลายเป็น action items + assignee + deadline โดยอัตโนมัติ ไม่ต้องจด ไม่ต้องสรุปเอง",
  keywords: ["meeting", "action items", "AI", "ประชุม", "สรุปประชุม", "ภาษาไทย"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#05050a] text-white">
        <AuthProvider>
          {/* Animated Mesh Gradient Background */}
          <div className="mesh-gradient">
            <div className="mesh-orb orb-1" />
            <div className="mesh-orb orb-2" />
            <div className="mesh-orb orb-3" />
          </div>

          <Navbar />
          <main className="flex-1 relative z-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
