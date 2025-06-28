import React, { useEffect, useState } from "react";

export default function AdminLogs({ role }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({ admin: "", action: "", start_date: "", end_date: "" });
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [sort, setSort] = useState("timestamp-desc");
  const itemsPerPage = 10;

  const loadLogs = () => {
    if (role === "owner") {
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        admin: filter.admin,
        action: filter.action,
        sort,
        start_date: filter.start_date,
        end_date: filter.end_date,
      });
      fetch(`https://your-api.onrender.com/admin/logs?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setLogs(data.logs || []);
          setPageCount(data.totalPages || 1);
        });
    }
  };

  React.useEffect(() => {
    loadLogs();
  }, [role, page, filter, sort]);

  const downloadCSV = () => {
    const params = new URLSearchParams({
      admin: filter.admin,
      action: filter.action,
      sort,
      start_date: filter.start_date,
      end_date: filter.end_date,
    });
    window.location.href = `https://your-api.onrender.com/admin/logs/export?${params.toString()}`;
  };

  if (role !== "owner") return null;

  return (
    <div>
      <h3>📜 Admin Activity Logs</h3>

      <div style={{ marginBottom: 10 }}>
        <input
          type="date"
          value={filter.start_date}
          onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
          style={{ marginRight: 10 }}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filter.end_date}
          onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
          style={{ marginRight: 10 }}
          placeholder="End Date"
        />
        <input
          placeholder="Filter by admin"
          value={filter.admin}
          onChange={(e) => setFilter({ ...filter, admin: e.target.value })}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Filter by action"
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          style={{ marginRight: 10 }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ marginRight: 10 }}>
          <option value="timestamp-desc">Newest First</option>
          <option value="timestamp-asc">Oldest First</option>
        </select>
        <button onClick={downloadCSV}>Export CSV</button>
      </div>

      <table border="1" cellPadding={8}>
        <thead>
          <tr>
            <th>Admin</th>
            <th>Role</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.admin}</td>
              <td>{log.role}</td>
              <td>{log.action}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {pageCount}
        </span>
        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
          Next
        </button>
      </div>
    </div>
  );
}
