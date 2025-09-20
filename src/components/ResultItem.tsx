interface IProps {
  result: any;
  onClick?: () => void;
}

export const ResultItem = (props: IProps) => {
  return (
    <div key={props.result.id} onClick={props.onClick}>
      <img
        src={props.result.imageUrl}
        alt={`Image satellite ${props.result.id}`}
        width={200}
      />
    </div>
  );
};
