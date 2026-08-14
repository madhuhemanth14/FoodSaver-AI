function NGOSearch({ searchTerm, onSearch }) {

  return (
    <div className="ngo-search">

      <input
        type="text"
        placeholder="Search NGOs..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />

      <button type="button">
        🔍
      </button>

    </div>
  );
}

export default NGOSearch;