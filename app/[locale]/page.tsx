import Link from "next/link";
import { getDictionary, t, type Locale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{t(dict, "home.title")}</h1>
      <p>
        <Link href={`/${locale}/map`} style={{ textDecoration: "underline" }}>
          {t(dict, "home.openMap")}
        </Link>
      </p>
    </main>
  );
}
