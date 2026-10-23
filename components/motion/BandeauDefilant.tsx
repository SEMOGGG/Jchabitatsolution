export default function BandeauDefilant({ elements }: { elements: string[] }) {
  const serie = [...elements, ...elements];
  return (
    <div className="bandeau" aria-label={`Interventions : ${elements.join(", ")}`}>
      <div className="bandeau-piste" aria-hidden="true">
        {serie.map((element, index) => (
          <span key={index} className={`bandeau-element${index % 2 ? " contour" : ""}`}>
            {element}
            <span className="bandeau-etoile">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
