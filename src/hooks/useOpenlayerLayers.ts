import { useEffect, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { OSM, TileWMS } from "ol/source";

export const useOpenlayerLayers = () => {
  const [layers, setLayers] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/carto/getInstanceId")
      .then((res) => res.json())
      .then((data) => {
        const newLayers = [
          new TileLayer({
            source: new TileWMS({
              url: `https://sh.dataspace.copernicus.eu/ogc/wms/${data.instanceId}`,
              params: { LAYERS: "TRUE_COLOR", TILED: true },
            }),
            properties: {
              id: "sentinel-hub",
              name: "Sentinel 2 - True Color",
              type: "base",
            },
          }),
          new TileLayer({
            source: new OSM(),
            properties: { id: "osm-base", name: "OpenStreetMap", type: "base" },
          }),
        ];

        setLayers(newLayers);
      });
  }, []);

  return layers;
};
