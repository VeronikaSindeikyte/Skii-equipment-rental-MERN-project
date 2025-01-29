
const Drafts = ({ drafts = [], onDelete, onEdit }) => {
  return (
      <div className="drafts">
          <h3>Juodraščiai</h3>
          {drafts.length === 0 ? (
              <p>Nėra juodraščių</p>
          ) : (
              <ul>
                  {drafts.map((draft, index) => (
                      <li key={index}>
                          <strong>{draft.title || "Neužpildytas"}</strong> - {draft.description || "Nėra aprašymo"}
                          <span> ({draft.rentPricePerDay ? `${draft.rentPricePerDay}€` : "Kaina neįvesta"})</span>
                          <div className="draft-actions">
                              <button onClick={() => onEdit(index)}>Redaguoti</button>
                              <button onClick={() => onDelete(index)}>Pašalinti</button>
                          </div>
                      </li>
                  ))}
              </ul>
          )}
      </div>
  );
};

export default Drafts;