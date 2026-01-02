"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

function toggleLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

function buildSwitchedPath(pathname: string, currentLocale: Locale) {
  // pathname ex: /fr/map, /en/plaque/abc, /fr
  const nextLocale = toggleLocale(currentLocale);

  // remplace uniquement le premier segment (/fr ou /en)
  if (pathname === `/${currentLocale}`) return `/${nextLocale}`;
  if (pathname.startsWith(`/${currentLocale}/`)) {
    return `/${nextLocale}${pathname.slice(`/${currentLocale}`.length)}`;
  }

  // fallback : si jamais on est sur une route non localisée
  return `/${nextLocale}`;
}

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const target = buildSwitchedPath(pathname || "/", locale);

  return (
    <Link
      href={target}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        border: "1px solid #ddd",
        borderRadius: 10,
        background: "white",
        fontFamily: "system-ui",
        fontSize: 14,
        textDecoration: "none",
        cursor: "pointer",
      }}
      aria-label={locale === "fr" ? "Changer la langue" : "Change language"}
      title={locale === "fr" ? "Passer en anglais" : "Switch to French"}
    >
      <span style={{ fontWeight: 700 }}>{locale.toUpperCase()}</span>
      <span style={{ opacity: 0.6 }}>→</span>
      <span style={{ fontWeight: 700 }}>{toggleLocale(locale).toUpperCase()}</span>
    </Link>
  );
}
