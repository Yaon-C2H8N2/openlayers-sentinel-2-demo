import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useEffect, useRef } from "react";

const useOpenlayerMap = (target: string) => {
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
          properties: { id: "osm-base", name: "OpenStreetMap", type: "base" },
        }),
      ],
      view: new View({
        projection: "EPSG:4326",
        center: [2.33, 48.19],
        zoom: 6,
      }),
    });
  }, []);

  return map;
};

export default useOpenlayerMap;
