// app/layout.tsx
//implement karna hai  forcedlogout agar issue ayaga to thik hai aur yaaha import karke use karn laana hai
import "./globals.css";
import ReduxProviders from "./ReduxProviders";
import ClientAuthListener from "./ClientAuthListener";
export const metadata = {
  verification: {
    google: "Hr6ao2ZD8sWSrzjQG9OOFmuQscHJsz9xb12PUIeMsgQ", // 👈 yahan apna code paste karo
  },
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch(_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-primary)] text-[var(--color-foreground)] transition-colors duration-300">
        <ReduxProviders>
          <ClientAuthListener />
          <div className="">{children}</div>
        </ReduxProviders>
      </body>
    </html>
  );
}
