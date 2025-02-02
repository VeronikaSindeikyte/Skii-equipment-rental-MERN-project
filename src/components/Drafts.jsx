import "./componentsCSS/Drafts.css"

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
                            {draft.photos && draft.photos.length > 0 ? (
                                <img
                                    src={draft.photos[0]}
                                    alt={draft.title || "Įrangos nuotrauka"}
                                    className="iranga-photo"
                                />
                            ) : (
                                <div className="iranga-photo-placeholder">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="48"
                                        height="48"
                                        fill="gray"
                                    >
                                        <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 5h14v10.09l-2.5-2.5a1 1 0 0 0-1.42 0L11 16l-2.09-2.09a1 1 0 0 0-1.42 0L5 16.5zm0 14v-.59l3.5-3.5 2.09 2.09a1 1 0 0 0 1.42 0L15 14.5l3.5 3.5V19z" />
                                        <circle cx="8" cy="8" r="2" />
                                    </svg>
                                </div>
                            )}
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