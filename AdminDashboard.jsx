
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import "./AdminDashboard.css";

function AdminDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Dashboard load nahi hua");
        }

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user.token]);

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">Dashboard Error: {error}</div>;
  }

  const bookings = data.bookings || [];

  // Search and status filter
  const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(booking.booking_id).toLowerCase().includes(search) ||
      (booking.customer_name || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      (booking.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Booking status chart data
  const statusCounts = bookings.reduce((result, booking) => {
    const status = booking.status || "Unknown";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  const statusChartData = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  const chartColors = [
    "#d4a843",
    "#3182ce",
    "#38a169",
    "#e05252",
    "#805ad5",
    "#718096",
  ];

  // Monthly bookings chart data
  const monthlyCounts = {};

  bookings.forEach((booking) => {
    if (!booking.booking_date) return;

    const date = new Date(
      `${String(booking.booking_date).slice(0, 10)}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const monthName = date.toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyCounts[monthKey]) {
      monthlyCounts[monthKey] = { month: monthName, bookings: 0 };
    }

    monthlyCounts[monthKey].bookings++;
  });

  const monthlyChartData = Object.keys(monthlyCounts)
    .sort()
    .map((key) => monthlyCounts[key]);

  // Last 7 days booking trend
  const dailyCounts = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    dailyCounts[key] = {
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      bookings: 0,
    };
  }

  bookings.forEach((booking) => {
    if (!booking.booking_date) return;

    const key = String(booking.booking_date).slice(0, 10);

    if (dailyCounts[key]) {
      dailyCounts[key].bookings++;
    }
  });

  const trendChartData = Object.values(dailyCounts);

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>

        <button className="admin-logout" onClick={onLogout}>
          Logout
        </button>
      </header>

      {/* STATISTICS */}
      <section className="admin-stats">
        <div className="admin-stat-card">
          <h3>Total Customers</h3>
          <h2>{data.stats.totalCustomers}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Total Workers</h3>
          <h2>{data.stats.totalWorkers}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Total Bookings</h3>
          <h2>{data.stats.totalBookings}</h2>
        </div>

        <div className="admin-stat-card">
          <h3>Pending Bookings</h3>
          <h2>{data.stats.pendingBookings}</h2>
        </div>
      </section>

      {/* CHARTS */}
      <section className="admin-section">
        <h2>Booking Analytics</h2>

        <div className="admin-charts">

          {/* PIE CHART */}
          <div className="admin-chart-card">
            <h3>Booking Status</h3>

            {statusChartData.length === 0 ? (
              <p>No booking data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* BAR CHART */}
          <div className="admin-chart-card">
            <h3>Monthly Bookings</h3>

            {monthlyChartData.length === 0 ? (
              <p>No booking data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="bookings"
                    fill="#d4a843"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* LINE CHART */}
          <div className="admin-chart-card admin-chart-wide">
            <h3>Booking Trends (Last 7 Days)</h3>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3182ce"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      {/* BOOKINGS */}
      <section className="admin-section">
        <h2>All Bookings</h2>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search by booking ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Customer Phone</th>
                <th>Worker</th>
                <th>Service</th>
                <th>Total</th>
                <th>Status</th>
                <th>Address</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.customer_name || "N/A"}</td>
                  <td>{booking.customer_phone || "N/A"}</td>
                  <td>{booking.worker_name || "Not Assigned"}</td>
                  <td>{booking.service_name || "N/A"}</td>
                  <td>
                    ₹{Number(booking.estimated_total || 0).toFixed(2)}
                  </td>
                  <td>
                    <span className="admin-status">
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.service_address || "N/A"}</td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="8">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CUSTOMERS */}
      <section className="admin-section">
        <h2>All Customers</h2>

        <div className="admin-person-list">
          {data.users
            .filter((customer) => customer.role === "customer")
            .map((customer) => (
              <div className="admin-person-card" key={customer.id}>
                <h3>{customer.name}</h3>
                <p>Email: {customer.email}</p>
                <p>Phone: {customer.phone || "N/A"}</p>
              </div>
            ))}
        </div>
      </section>

      {/* WORKERS */}
      <section className="admin-section">
        <h2>All Workers</h2>

        <div className="admin-person-list">
          {data.workers.map((worker) => (
            <div className="admin-person-card" key={worker.id}>
              <h3>{worker.name}</h3>
              <p>Service: {worker.job}</p>
              <p>Location: {worker.location}</p>
              <p>Price: ₹{worker.price}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;
