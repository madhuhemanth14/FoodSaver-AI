/**
 * Generic data table reused by UserManagement, NGOManagement, and
 * DonationManagement. Styling lives in styles/admin-theme.css
 * (.admin-table-wrap / .admin-table) so every admin table matches.
 *
 * @param {{
 *   columns: Array<{ key: string, label: string, render?: (row: object) => React.ReactNode }>,
 *   rows: Array<object>,
 *   loading?: boolean,
 *   emptyMessage?: string,
 *   getRowActions?: (row: object) => React.ReactNode,
 * }} props
 */
const DataTable = ({ columns, rows, loading = false, emptyMessage = "No results.", getRowActions }) => {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {getRowActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="admin-table__loading" colSpan={columns.length + (getRowActions ? 1 : 0)}>
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="admin-table__empty" colSpan={columns.length + (getRowActions ? 1 : 0)}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                {getRowActions && <td>{getRowActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
