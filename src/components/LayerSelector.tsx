import { useOpenlayerLayers } from "@/hooks/useOpenlayerLayers";
import { useEffect, useState } from "react";

interface IProps {
  onNewLayerSelected: (layer: any) => void;
}

export const LayerSelector = (props: IProps) => {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const layers = useOpenlayerLayers();

  useEffect(() => {
    if (!layers) return;
    props.onNewLayerSelected(layers[selectedLayer]);
  }, [selectedLayer, layers]);

  return (
    <div className="layer-selector">
      <h2>Layers</h2>
      {layers ? (
        layers.map((layer, index) => (
          <div key={layer.get("id")}>
            <input
              type="radio"
              id={layer.get("id")}
              name="base-layer"
              value={index}
              checked={selectedLayer === index}
              onChange={() => setSelectedLayer(index)}
            />
            <label htmlFor={layer.get("id")}>{layer.get("name")}</label>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
