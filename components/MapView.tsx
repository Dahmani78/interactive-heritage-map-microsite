"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export type PlaqueProps = {
  id: string;
  slug: string;
  title: string;
  theme?: string;
  period_bucket?: string;
};

export type PlaqueFeature = {
  type: "Feature";
  properties: PlaqueProps;
  geometry: { type: "Point"; coordinates: [number, number] };
};

export default function MapView({
  locale,
  onLoaded,
  onSelect,
}: {
  locale: "fr" | "en";
  onLoaded: (args: { map: maplibregl.Map; features: PlaqueFeature[] }) => void;
  onSelect: (feature: PlaqueFeature) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Stocker les callbacks dans des refs (évite de relancer l'effet)
  const onLoadedRef = useRef(onLoaded);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si la carte existe déjà, ne pas la recréer.
    // (On peut juste garder locale pour construire les URLs ailleurs)
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [-7.62, 33.59],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl({ showZoom: true }), "top-right");
    mapRef.current = map;

    const onLoad = async () => {
      const res = await fetch("/data/plaques.geojson", { cache: "no-store" });
      const geojson = await res.json();

      const features: PlaqueFeature[] = geojson.features ?? [];

      if (!map.getSource("plaques")) {
        map.addSource("plaques", { type: "geojson", data: geojson });
      }

      if (!map.getLayer("plaques-circle")) {
        map.addLayer({
          id: "plaques-circle",
          type: "circle",
          source: "plaques",
          paint: {
            "circle-radius": 7,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-color": "#111111",
          },
        });

        map.on("mouseenter", "plaques-circle", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "plaques-circle", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "plaques-circle", (e) => {
          const f = e.features?.[0] as any;
          if (!f) return;
          onSelectRef.current(f as PlaqueFeature);
        });
      }

      onLoadedRef.current({ map, features });
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      map.remove();
      mapRef.current = null;
    };
    // IMPORTANT: dépend seulement de locale (et en pratique on ne recrée pas la carte)
  }, [locale]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
