
import { useEffect, useState } from "react";

function WorkerDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      const response = await fetch(
        "http://localhost:5000/worker/bookings",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bookings load nahi hui");
      }

      setBookings(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, status) {
    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Status update nahi hua");
      }

      await loadBookings();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) {
    return <p>Bookings load ho rahi hain...</p>;
  }

  return (
    <div className="worker-dashboard">
      <h1>Worker Dashboard</h1>
      <p>Welcome, {user.name}!</p>

      {error && <p>{error}</p>}

      {!error && bookings.length === 0 && (
        <p>Abhi koi booking nahi hai.</p>
      )}

      
     {bookings.map((booking) => (
  <div
    key={booking.id}
    className="booking-card"
    style={{
      background: "#ffffff",
      color: "#1f2937",
      border: "1px solid #dbe3ef",
      borderLeft: `5px solid ${
        booking.status === "Pending"
          ? "#eab308"
          : booking.status === "Accepted"
          ? "#16a34a"
          : booking.status === "Rejected"
          ? "#dc2626"
          : "#2563eb"
      }`,
      borderRadius: "14px",
      padding: "22px",
      marginBottom: "20px",
      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
      lineHeight: "1.6",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      <h3 style={{ margin: 0, color: "#0f172a" }}>
        Booking #{booking.id}
      </h3>

      <span
        style={{
          backgroundColor:
            booking.status === "Pending"
              ? "#fef3c7"
              : booking.status === "Accepted"
              ? "#dcfce7"
              : booking.status === "Rejected"
              ? "#fee2e2"
              : "#dbeafe",
          color:
            booking.status === "Pending"
              ? "#92400e"
              : booking.status === "Accepted"
              ? "#166534"
              : booking.status === "Rejected"
              ? "#991b1b"
              : "#1d4ed8",
          padding: "6px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        {booking.status}
      </span>
    </div>

    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      {[
        ["Customer", booking.customer_name],
        ["Date", String(booking.booking_date).slice(0, 10)],
        ["Time", String(booking.booking_time)],
        ["Address", booking.service_address],
        ["Problem", booking.problem_description],
      ].map(([label, value]) => (
        <p
          key={label}
          style={{
            margin: "0 0 10px",
            color: "#334155",
            overflowWrap: "anywhere",
          }}
        >
          <strong style={{ color: "#0f172a" }}>
            {label}:
          </strong>{" "}
          {value || "Not provided"}
        </p>
      ))}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      {[
        ["Service Price", booking.service_price],
        ["Visiting Fee", booking.visiting_fee],
        ["Estimated Total", booking.estimated_total],
      ].map(([label, amount]) => (
        <div
          key={label}
          style={{
            background: label === "Estimated Total" ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${
              label === "Estimated Total" ? "#bfdbfe" : "#e2e8f0"
            }`,
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "13px" }}>
            {label}
          </div>
          <div
            style={{
              color: label === "Estimated Total" ? "#1d4ed8" : "#0f172a",
              fontSize: "20px",
              fontWeight: "700",
              marginTop: "5px",
            }}
          >
            ₹{Number(amount || 0).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        borderTop: "1px solid #e2e8f0",
        paddingTop: "16px",
      }}
    >
      {booking.status === "Pending" && (
        <>
          <button
            onClick={() => updateStatus(booking.id, "Accepted")}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ✓ Accept
          </button>

          <button
            onClick={() => updateStatus(booking.id, "Rejected")}
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ✕ Reject
          </button>
        </>
      )}

      {booking.status === "Accepted" && (
        <button
          onClick={() => {
            if (
              window.confirm(
                "Kya tum is booking ko Completed mark karna chahte ho?"
              )
            ) {
              updateStatus(booking.id, "Completed");
            }
          }}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "7px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ✓ Mark Completed
        </button>
      )}
    </div>
  </div>
))}
    </div>
  );
}

export default WorkerDashboard;
