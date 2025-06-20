// app/layout.tsx
import "./globals.css";
import ReduxProviders from "./ReduxProviders"; // New component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `...(your dark mode script)...`,
          }}
        />
      </head>
      <body className=" max-w-[1440px] mx-auto min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}
