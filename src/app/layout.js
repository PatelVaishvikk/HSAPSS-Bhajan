import "./globals.css";

export const metadata = {
  title: "HSAPSS Bhajans - Divine Sanctuary",
  description: "A premium spiritual platform for searching, reading, and contributing bhajans",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HSAPSS Bhajans",
  },
};

export const viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
