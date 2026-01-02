import type { Locale } from "@/lib/i18n";
import LanguageSwitch from "@/components/LanguageSwitch";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div data-locale={locale} style={{ minHeight: "100vh" }}>
      {/* Header simple */}
      <header
        style={{
          position: "fixed",
          top: 12,
          right: 50,
          zIndex: 9999,
        }}
      >
        <LanguageSwitch locale={locale} />
      </header>

      {children}
    </div>
  );
}
