"use client";

import { useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import MapView, { PlaqueFeature } from "./MapView";
import { getDictionary, t, type Locale } from "@/lib/i18n";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

// Distance haversine en km entre 2 points [lng, lat]
function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapShell({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const [features, setFeatures] = useState<PlaqueFeature[]>([]);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("");
  const [period, setPeriod] = useState("");

  // Near me states
  const [userPos, setUserPos] = useState<[number, number] | null>(null); // [lng, lat]
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const themes = useMemo(
    () => uniqueSorted(features.map((f) => f.properties.theme ?? "")),
    [features]
  );
  const periods = useMemo(
    () => uniqueSorted(features.map((f) => f.properties.period_bucket ?? "")),
    [features]
  );

  const nearMe = () => {
    setLocError(null);
    setLocating(true);

    if (!navigator.geolocation) {
      setLocating(false);
      setLocError(t(dict, "map.locationUnavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;

        setUserPos([lng, lat]);
        setSortByDistance(true);
        setLocating(false);

        // Centre la carte sur l'utilisateur
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
      },
      (err) => {
        setLocating(false);

        if (err.code === err.PERMISSION_DENIED) {
          setLocError(t(dict, "map.permissionDenied"));
        } else {
          setLocError(t(dict, "map.locationUnavailable"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filtrage + distances + tri
  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();

    const base = features
      .filter((f) => {
        const p = f.properties;
        const okQ = !qNorm || (p.title ?? "").toLowerCase().includes(qNorm);
        const okTheme = !theme || (p.theme ?? "") === theme;
        const okPeriod = !period || (p.period_bucket ?? "") === period;
        return okQ && okTheme && okPeriod;
      })
      .map((f) => {
        const coords = f.geometry.coordinates; // [lng, lat]
        const distanceKm = userPos ? haversineKm(userPos, coords) : null;
        return { f, distanceKm };
      });

    if (sortByDistance && userPos) {
      base.sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return base;
  }, [features, q, theme, period, userPos, sortByDistance]);

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

          {/* Near me button */}
          <button
            onClick={nearMe}
            disabled={locating}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 10,
              background: locating ? "#f2f2f2" : "white",
              cursor: locating ? "not-allowed" : "pointer",
            }}
          >
            {locating ? t(dict, "map.locating") : t(dict, "map.nearMe")}
          </button>

          {locError ? (
            <div style={{ fontSize: 12, color: "#b00020" }}>{locError}</div>
          ) : null}
        </div>

        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          {filtered.length} / {features.length}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map(({ f, distanceKm }) => (
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
                {distanceKm != null ? ` • ${distanceKm.toFixed(1)} ${t(dict, "map.distanceKm")}` : ""}
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
