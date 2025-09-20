import { useState } from "react";

interface IProps {
  onSearch: (filters: CartoFilters) => void;
}

export interface CartoFilters {
  cloudCover: number;
  dateFrom: string;
  dateTo: string;
}

export const Filters = (props: IProps) => {
  const today = new Date();
  const priorDate = new Date().setDate(today.getDate() - 7);
  const [filtres, setFiltres] = useState<CartoFilters>({
    cloudCover: 50,
    dateFrom: new Date(priorDate).toISOString().split("T")[0]!,
    dateTo: today.toISOString().split("T")[0]!,
  });

  return (
    <div className="carto-filters">
      <h2>Filtres</h2>
      <div className="date-filters">
        <label htmlFor="dateFrom">Date de début :</label>
        <label htmlFor="dateTo">Date de fin :</label>
        <input
          type="date"
          name="dateFrom"
          value={filtres.dateFrom}
          onChange={(e) => setFiltres({ ...filtres, dateFrom: e.target.value })}
        />
        <input
          type="date"
          name="dateTo"
          value={filtres.dateTo}
          onChange={(e) => setFiltres({ ...filtres, dateTo: e.target.value })}
        />
      </div>
      <p>Couverture nuageuse : {filtres.cloudCover}%</p>
      <input
        type="range"
        value={filtres.cloudCover}
        min={0}
        max={100}
        step={1}
        onChange={(e) =>
          setFiltres({ ...filtres, cloudCover: Number(e.target.value) })
        }
      />
      <input
        type="button"
        onClick={() => props.onSearch(filtres)}
        value="Search"
      />
    </div>
  );
};
