import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

function Table({ columns, data, searchable = false, searchKeys = [], emptyMessage = "No data found" }) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = searchable
    ? data.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] || "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortCol] ?? "";
        const bVal = b[sortCol] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(colKey);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                  tabIndex={col.sortable ? 0 : undefined}
                  role={col.sortable ? "button" : undefined}
                  aria-sort={col.sortable && sortCol === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  className={`
                    px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider
                    ${col.sortable ? "cursor-pointer hover:text-white select-none focus:outline-none focus:text-white focus:ring-1 focus:ring-inset focus:ring-indigo-500/50" : ""}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortCol === col.key && (
                      sortDir === "asc" ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-indigo-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-slate-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row._id || i}
                  className="hover:bg-slate-800/40 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-slate-300">
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <p className="text-xs text-slate-500 font-medium text-right px-1">
          Showing {sorted.length} record{sorted.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default Table;
