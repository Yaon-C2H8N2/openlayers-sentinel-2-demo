import { ResultItem } from "./ResultItem";

interface IProps {
  results: any[];
  loading: boolean;
  onImageClick: (result: any) => void;
}

export const ResultList = (props: IProps) => {
  return (
    <div className="results-list">
      <h2>Resultats ({props.results.length})</h2>
      <div className="results-container">
        {props.loading ? (
          <p>Loading...</p>
        ) : (
          props.results.map((result) => (
            <ResultItem
              key={result.id}
              result={result}
              onClick={() => props.onImageClick(result)}
            />
          ))
        )}
      </div>
    </div>
  );
};
