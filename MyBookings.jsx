import { useEffect, useState } from "react";
import "./MyBookings.css";

function MyBookings({ onBack, userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const cancelBooking = async () => {
  const booking = selectedBooking;

  if (!booking) return;

  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmCancel) return;

  try {
    const response = await fetch(
      `http://localhost:5000/bookings/${booking.booking_id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not cancel booking");
    }

    setBookings((previousBookings) =>
      previousBookings.map((item) =>
        item.booking_id === booking.booking_id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setSelectedBooking((previousBooking) =>
      previousBooking
        ? { ...previousBooking, status: "Cancelled" }
        : null
    );

    alert("Booking cancelled successfully!");
  } catch (error) {
    console.error("Cancel booking error:", error);
    alert(error.message || "Unable to cancel booking. Please try again.");
  }
};

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:5000/my-bookings/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch bookings");
        }
        return response.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not specified";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-loading">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <header className="bookings-header">
        <div>
          <p className="bookings-label">MY ACCOUNT</p>
          <h1>My Bookings</h1>
          <p>Track and manage all your worker bookings in one place.</p>
        </div>

        <div className="booking-count">
          <strong>{bookings.length}</strong>
          <span>Total Bookings</span>
        </div>
      </header>

      {bookings.length === 0 ? (
        <div className="empty-bookings">
          <div className="empty-icon">📅</div>
          <h2>No bookings yet</h2>
          <p>
            You haven't booked any worker yet. Find a professional and book
            your first service.
          </p>
          <button onClick={onBack}>Find a Worker →</button>
        </div>
      ) : (
        <>
          <p className="booking-click-hint">
            Select any booking card to view its complete details.
          </p>

          <div className="booking-list">
            {bookings.map((booking) => (
              <div
                className="booking-card booking-card-clickable"
                key={booking.booking_id}
                role="button"
                tabIndex={0}
                aria-label={`View booking ${booking.booking_id} details`}
                onClick={() => setSelectedBooking(booking)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedBooking(booking);
                  }
                }}
              >
                <div className="booking-top">
                  <div className="worker-info">
                    <div className="booking-avatar">
                      {booking.job === "Electrician"
                        ? "⚡"
                        : booking.job === "Plumber"
                        ? "🔧"
                        : booking.job === "Carpenter"
                        ? "🪚"
                        : "👷"}
                    </div>

                    <div>
                      <h2>{booking.worker_name || "Worker"}</h2>
                      <p>
                        {booking.job || "Service Professional"} ·{" "}
                        {booking.location || "Location not specified"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`status-badge ${String(
                      booking.status || "pending"
                    ).toLowerCase()}`}
                  >
                    ● {booking.status || "Pending"}
                  </span>
                </div>

                <div className="booking-service">
                  <small>BOOKED SERVICE</small>
                  <h3>{booking.service_name || "Service"}</h3>

                  <p className="service-pricing-note">
                    {booking.pricing_type === "Starting From"
                      ? "Starting from the listed service price"
                      : "Fixed service price"}
                  </p>
                </div>

                <div className="booking-problem">
                  <h3>🛠️ Your Problem</h3>
                  <p>
                    {booking.problem_description ||
                      "No problem description provided."}
                  </p>

                  <h3>📍 Service Address</h3>
                  <p>
                    {booking.service_address ||
                      "No service address provided."}
                  </p>
                </div>

                <div className="booking-details">
                  <div className="booking-detail">
                    <span className="detail-icon">📅</span>
                    <div>
                      <small>Booking Date</small>
                      <strong>{formatDate(booking.booking_date)}</strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-icon">🕐</span>
                    <div>
                      <small>Booking Time</small>
                      <strong>{booking.booking_time || "Not specified"}</strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-icon">📍</span>
                    <div>
                      <small>Location</small>
                      <strong>{booking.location || "Not specified"}</strong>
                    </div>
                  </div>

                  <div className="booking-detail">
                    <span className="detail-icon">⏱</span>
                    <div>
                      <small>Estimated Duration</small>
                      <strong>
                        {booking.estimated_duration || "Not specified"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="booking-pricing">
                  <h3>Price Breakdown</h3>

                  <div className="price-row">
                    <span>Service Charge</span>
                    <strong>{formatPrice(booking.service_price)}</strong>
                  </div>

                  <div className="price-row">
                    <span>Visiting Fee</span>
                    <strong>{formatPrice(booking.visiting_fee)}</strong>
                  </div>

                  <div className="price-divider"></div>

                  <div className="price-row total-row">
                    <span>Estimated Total</span>
                    <strong>{formatPrice(booking.estimated_total)}</strong>
                  </div>

                  <p className="materials-note">
                    ℹ️ Materials/parts are not included in the estimated total.
                  </p>
                </div>

                <div className="booking-footer">
                  <span>
                    Booking ID: <strong>#{booking.booking_id}</strong>
                  </span>
                  <span className="booking-user">
                    Booked by {booking.user_name || "You"}
                  </span>
                </div>

                <div className="booking-open-hint">
                  View complete details →
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedBooking && (
        <div
          className="booking-modal-overlay"
          onClick={() => setSelectedBooking(null)}
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <p className="bookings-label">BOOKING DETAILS</p>
                <h2 id="booking-modal-title">
                  Booking #{selectedBooking.booking_id}
                </h2>
              </div>

              <button
                className="booking-modal-close"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
              >
                ×
              </button>
            </div>

            <div className="booking-modal-body">
              <div className="booking-modal-worker">
                <div className="booking-avatar">👷</div>
                <div>
                  <h3>{selectedBooking.worker_name || "Worker"}</h3>
                  <p>
                    {selectedBooking.job || "Service Professional"}
                    {" · "}
                    {selectedBooking.location || "Location not specified"}
                  </p>
                </div>
              </div>

              <div className="booking-modal-section">
                <h3>Service Information</h3>
                <p>
                  <strong>Service:</strong>{" "}
                  {selectedBooking.service_name || "Not specified"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedBooking.status || "Pending"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedBooking.booking_date)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {selectedBooking.booking_time || "Not specified"}
                </p>
                <p>
                  <strong>Estimated duration:</strong>{" "}
                  {selectedBooking.estimated_duration || "Not specified"}
                </p>
              </div>

              <div className="booking-modal-section">
                <h3>Service Address & Problem</h3>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedBooking.service_address || "Not provided"}
                </p>
                <p>
                  <strong>Problem:</strong>{" "}
                  {selectedBooking.problem_description || "Not provided"}
                </p>
              </div>

              <div className="booking-modal-section">
                <h3>Price Breakdown</h3>
                <div className="price-row">
                  <span>Service Charge</span>
                  <strong>
                    {formatPrice(selectedBooking.service_price)}
                  </strong>
                </div>
                <div className="price-row">
                  <span>Visiting Fee</span>
                  <strong>
                    {formatPrice(selectedBooking.visiting_fee)}
                  </strong>
                </div>
                <div className="price-divider"></div>
                <div className="price-row total-row">
                  <span>Estimated Total</span>
                  <strong>
                    {formatPrice(selectedBooking.estimated_total)}
                  </strong>
                </div>
                <p className="materials-note">
                  Materials/parts are not included in the estimated total.
                </p>
              </div>

              <p className="booking-modal-customer">
                Booking made by {selectedBooking.user_name || "You"}
              </p>
            </div>

           <div className="booking-modal-footer">
  {selectedBooking.status === "Pending" && (
    <button
      className="booking-cancel-button"
      onClick={cancelBooking}
    >
      Cancel Booking
    </button>
  )}

  <button
    className="booking-modal-done"
    onClick={() => setSelectedBooking(null)}
  >
    Close Details
  </button>
</div> 
          </section>
        </div>
      )}
    </div>
  );
}

export default MyBookings;