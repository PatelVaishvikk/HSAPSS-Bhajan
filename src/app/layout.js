import "./globals.css";

export const metadata = {
  title: "HSAPSS Bhajans - Divine Sanctuary",
  description: "A premium spiritual platform for searching, reading, and contributing bhajans",
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
