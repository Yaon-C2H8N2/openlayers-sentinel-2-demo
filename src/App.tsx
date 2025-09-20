import useOpenlayerMap from "./hooks/useOpenlayerMap";
import "./App.css";
import { useState } from "react";
import ImageLayer from "ol/layer/Image.js";
import Static from "ol/source/ImageStatic.js";
import { Filters, type CartoFilters } from "./components/Filters";
import { ResultList } from "./components/ResultList";
import { LayerSelector } from "./components/LayerSelector";

export const App = () => {
  const map = useOpenlayerMap("map");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (filterValues: CartoFilters) => {
    setLoading(true);
    const bbox = map.current?.getView().calculateExtent(map.current.getSize());

    const params = new URLSearchParams({
      bbox: bbox?.join(",") ?? "",
      fromDate: filterValues.dateFrom ?? "",
      toDate: filterValues.dateTo ?? "",
      cloudCover: filterValues.cloudCover.toString(),
    });

    const searchResults = await fetch(
      `/api/carto/searchImages?${params.toString()}`,
      {
        method: "GET",
      },
    );

    const searchResultsJson = await searchResults.json();
    const newResults: any[] = searchResultsJson.response.features;

    await Promise.all(
      newResults.map(async (feature, index) => {
        const fromDate = new Date(feature.properties.datetime);

        const fetchParams = new URLSearchParams({
          bbox: bbox?.join(",") ?? "",
          fromDate: fromDate.toISOString().split("T")[0] ?? "",
          toDate:
            new Date(fromDate.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0] ?? "",
          cloudCover: filterValues.cloudCover.toString(),
        });

        const imageResult = await fetch(
          `/api/carto/fetchImage?${fetchParams.toString()}`,
          {
            method: "GET",
          },
        );
        const imageBlob = await imageResult.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        newResults[index].imageUrl = imageUrl;
        newResults[index].bbox = bbox;
      }),
    );

    setResults(newResults);
    setLoading(false);
  };

  const handleImageClick = (result: any) => {
    const layers = map.current?.getLayers().getArray();
    layers?.forEach((layer) => {
      if (layer instanceof ImageLayer) {
        map.current?.removeLayer(layer);
      }
    });

    const extent = result.bbox;
    const imageLayer = new ImageLayer({
      source: new Static({
        url: result.imageUrl,
        projection: "EPSG:4326",
        imageExtent: extent,
      }),
      opacity: 1,
    });
    map.current?.addLayer(imageLayer);
  };

  const handleNewLayerSelected = (layer: any) => {
    const layers = map.current?.getLayers().getArray();
    layers?.forEach((l) => {
      if (l.get("type") === "base") {
        map.current?.removeLayer(l);
      }
    });
    map.current?.getLayers().insertAt(0, layer);
  };

  return (
    <div className="app">
      <h1>OpenLayers + Copernicus Data Space Ecosystem</h1>
      <div className="map-container">
        <ResultList
          results={results}
          loading={loading}
          onImageClick={handleImageClick}
        />
        <div id="map" className="map"></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <LayerSelector onNewLayerSelected={handleNewLayerSelected} />
          <Filters onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
};

export default App;
