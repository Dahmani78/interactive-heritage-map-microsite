import { getDictionary, t, type Locale } from "@/lib/i18n";
import Link from "next/link";

export default async function PlaquePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        {t(dict, "plaque.title")} – {slug}
      </h1>

      <p>
        <Link href={`/${locale}/map`} style={{ textDecoration: "underline" }}>
          {t(dict, "nav.backToMap")}
        </Link>
      </p>
    </main>
  );
}
