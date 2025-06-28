import React, { useEffect, useState } from "react";
import AdminLogs from "./Logs";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const login = async () => {
    const res = await fetch("https://your-api.onrender.com/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.authenticated) {
      setAuthenticated(true);
      setUsers(data.users);
      setRole(data.role);
    } else {
      alert("Access denied");
    }
  };

  const revokeAccess = async (targetEmail) => {
    const res = await fetch("https://your-api.onrender.com/admin/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin: email, target: targetEmail }),
    });
    const data = await res.json();
    alert(data.message);
    login();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 Admin Dashboard</h2>
      {!authenticated ? (
        <div>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <>
          <p>Logged in as <b>{email}</b> ({role})</p>
          <table border="1" cellPadding={8}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Access</th>
                {role === "owner" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.email}</td>
                  <td>{u.subscription_status || 'none'}</td>
                  <td>{u.access ? "✅" : "❌"}</td>
                  {role === "owner" && (
                    <td>
                      <button onClick={() => revokeAccess(u.email)}>Revoke</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <AdminLogs role={role} />
        </>
      )}
    </div>
  );
}
