import NGOCard from "./NGOCard";

function NGOList({ ngos = [], onViewDetails }) {

  if (ngos.length === 0) {
    return (
      <div className="no-ngos">
        <h3>No NGOs Found</h3>

        <p>
          Try changing your search or expanding your
          search radius.
        </p>
      </div>
    );
  }

  return (
    <div className="ngo-list">

      {ngos.map((ngo) => (
        <NGOCard
          key={ngo.id}
          ngo={ngo}
          onViewDetails={onViewDetails}
        />
      ))}

    </div>
  );
}

export default NGOList;