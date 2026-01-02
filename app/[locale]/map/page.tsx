import MapShell from "@/components/MapShell";
import type { Locale } from "@/lib/i18n";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <MapShell locale={locale} />;
}
