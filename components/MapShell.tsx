"use client";

import { useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import MapView, { PlaqueFeature } from "./MapView";
import { getDictionary, t, type Locale } from "@/lib/i18n";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function MapShell({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const [features, setFeatures] = useState<PlaqueFeature[]>([]);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("");
  const [period, setPeriod] = useState("");

  const themes = useMemo(
    () => uniqueSorted(features.map((f) => f.properties.theme ?? "")),
    [features]
  );
  const periods = useMemo(
    () => uniqueSorted(features.map((f) => f.properties.period_bucket ?? "")),
    [features]
  );

  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    return features.filter((f) => {
      const p = f.properties;
      const okQ = !qNorm || (p.title ?? "").toLowerCase().includes(qNorm);
      const okTheme = !theme || (p.theme ?? "") === theme;
      const okPeriod = !period || (p.period_bucket ?? "") === period;
      return okQ && okTheme && okPeriod;
    });
  }, [features, q, theme, period]);

  const selectFeature = (f: PlaqueFeature) => {
    const coords = f.geometry.coordinates;
    const title = f.properties.title ?? t(dict, "common.untitled");
    const themeLabel = t(dict, "plaque.theme");
    const periodLabel = t(dict, "plaque.period");
    const linkLabel = t(dict, "plaque.viewDetails");

    mapRef.current?.flyTo({ center: coords, zoom: 16 });

    new maplibregl.Popup({ offset: 12 })
      .setLngLat(coords)
      .setHTML(`
        <div style="min-width:200px">
          <div style="font-weight:600">${title}</div>
          <div style="font-size:12px;opacity:0.8">${themeLabel}: ${f.properties.theme ?? "-"}</div>
          <div style="font-size:12px;opacity:0.8">${periodLabel}: ${f.properties.period_bucket ?? "-"}</div>
          <div style="margin-top:8px">
            <a href="/${locale}/plaque/${f.properties.slug}" style="text-decoration:underline">
              ${linkLabel}
            </a>
          </div>
        </div>
      `)
      .addTo(mapRef.current!);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 360,
          padding: 12,
          borderRight: "1px solid #ddd",
          fontFamily: "system-ui",
          overflow: "auto",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {locale === "fr" ? "Plaques" : "Plaques"}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={locale === "fr" ? "Rechercher…" : "Search…"}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          />

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          >
            <option value="">{locale === "fr" ? "Tous les thèmes" : "All themes"}</option>
            {themes.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          >
            <option value="">{locale === "fr" ? "Toutes les périodes" : "All periods"}</option>
            {periods.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          {filtered.length} / {features.length}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((f) => (
            <button
              key={f.properties.id}
              onClick={() => selectFeature(f)}
              style={{
                textAlign: "left",
                padding: 10,
                border: "1px solid #eee",
                borderRadius: 10,
                background: "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 650 }}>{f.properties.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {(f.properties.theme ?? "-") + " • " + (f.properties.period_bucket ?? "-")}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Map */}
      <section style={{ flex: 1 }}>
        <MapView
          locale={locale}
          onLoaded={({ map, features }) => {
            mapRef.current = map;
            setFeatures(features);
          }}
          onSelect={(f) => selectFeature(f)}
        />
      </section>
    </div>
  );
}
