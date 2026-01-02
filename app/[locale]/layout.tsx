import type { Locale } from "@/lib/i18n";
import SetHtmlLang from "@/components/SetHtmlLang";

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
      <SetHtmlLang locale={locale} />
      {children}
    </div>
  );
}
