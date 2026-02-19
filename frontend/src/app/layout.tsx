// app/layout.tsx
import "./globals.css";
import ReduxProviders from "./ReduxProviders";
import ClientAuthListener from "./ClientAuthListener";
import LoginModal from "@/components/modals/loginModel"; // 👈 ADD THIS

export const metadata = {
  verification: {
    google: "Hr6ao2ZD8sWSrzjQG9OOFmuQscHJsz9xb12PUIeMsgQ",
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

          {children}

          {/* ✅ Global Login Modal */}
          <LoginModal />
        </ReduxProviders>
      </body>
    </html>
  );
}
