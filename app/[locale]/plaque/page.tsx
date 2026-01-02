import { getDictionary, t, type Locale } from "@/lib/i18n";
import Link from "next/link";

export default function PlaquePage({
  params
}: {
  params: { locale: Locale; slug: string };
}) {
  const dict = getDictionary(params.locale);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        {t(dict, "plaque.title")} – {params.slug}
      </h1>

      <p>
        <Link href={`/${params.locale}/map`} style={{ textDecoration: "underline" }}>
          {t(dict, "nav.backToMap")}
        </Link>
      </p>
    </main>
  );
}
