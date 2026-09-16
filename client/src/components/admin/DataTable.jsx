import "./DataTable.css";

export default function DataTable({ columns = [], data = [], loading = false, onRowClick, emptyMessage = "No data found" }) {
  if (loading) {
    return (
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map((i) => (
              <tr key={i} className="data-table__skeleton-row">
                {columns.map((c) => (
                  <td key={c.key}><div className="data-table__skeleton" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id || row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "data-table__clickable" : ""}
            >
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
