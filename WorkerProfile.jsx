import { useState, useEffect } from "react";
import "./WorkerProfile.css";

function WorkerProfile({ worker, onBack, userId }) {
  const [booked, setBooked] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const workerData = {
    rahul: {
      id: 1,
      name: "Rahul Kumar",
      job: "⚡ Electrician",
      location: "Lucknow",
      rating: "4.8",
      experience: "5 years",
      price: "₹299",
      avatar: "👨‍🔧",
      about:
        "Rahul is an experienced electrician providing reliable electrical repair, wiring and installation services.",
    },

    amit: {
      id: 2,
      name: "Amit Verma",
      job: "🔧 Plumber",
      location: "Kanpur",
      rating: "4.9",
      experience: "6 years",
      price: "₹349",
      avatar: "👨‍🔧",
      about:
        "Amit is an experienced plumber providing reliable plumbing repair, installation and maintenance services.",
    },

    sanjay: {
      id: 3,
      name: "Sanjay Yadav",
      job: "🪚 Carpenter",
      location: "Prayagraj",
      rating: "4.7",
      experience: "4 years",
      price: "₹399",
      avatar: "👨‍🔧",
      about:
        "Sanjay is an experienced carpenter providing furniture repair, door work and custom woodwork services.",
    },
  };

  const selectedWorker = workerData[worker];

  useEffect(() => {
    if (!selectedWorker?.id) {
      setServicesLoading(false);
      return;
    }

    setServicesLoading(true);

    fetch(`http://localhost:5000/worker-services/${selectedWorker.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        return response.json();
      })
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setServicesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching worker services:", error);
        setServices([]);
        setServicesLoading(false);
      });
  }, [selectedWorker?.id]);

  if (!selectedWorker) {
    return (
      <div className="worker-profile-page">
        <div className="profile-card">
          <h2>Worker not found</h2>

          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login before booking a worker.");
      return;
    }

    if (!selectedService) {
      alert("Please select a service first.");
      return;
    }

    if (!serviceAddress.trim()) {
      alert("Please enter your service address.");
      return;
    }

    if (!problemDescription.trim()) {
      alert("Please describe your problem.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          worker_id: selectedWorker.id,
          worker_service_id: selectedService.worker_service_id,
          booking_date: bookingDate,
          booking_time: bookingTime,
          service_address: serviceAddress,
          problem_description: problemDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBooked(true);
        console.log("Booking saved:", data);
      } else {
        alert(data.error || "Booking failed");
        console.error(data);
      }
    } catch (error) {
      alert("Server connection failed");
      console.error(error);
    }
  };

  return (
    <div className="worker-profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="profile-main">
          <div className="profile-avatar">{selectedWorker.avatar}</div>

          <div>
            <span className="profile-verified">✓ Verified Worker</span>

            <h1>{selectedWorker.name}</h1>

            <p>
              {selectedWorker.job} · {selectedWorker.location}
            </p>

            <p>
              ⭐ {selectedWorker.rating} · {selectedWorker.experience}{" "}
              experience
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="profile-content">
        {/* SERVICES */}
        <div className="profile-card services-card">
          <h2>Services Offered</h2>

          {servicesLoading ? (
            <p>Loading services...</p>
          ) : services.length === 0 ? (
            <p>No services available currently.</p>
          ) : (
            <div className="services-list">
              {services.map((service) => (
                <div
                  className={`service-item ${
                    selectedService?.worker_service_id ===
                    service.worker_service_id
                      ? "selected-service"
                      : ""
                  }`}
                  key={service.worker_service_id}
                >
                  <div className="service-details">
                    <h3>{service.service_name}</h3>

                    <p>{service.description}</p>

                    <small>
                      ⏱ Estimated time: {service.estimated_duration}
                    </small>
                  </div>

                  <div className="service-price">
                    <strong>
                      {service.pricing_type === "Starting From"
                        ? `From ₹${service.price}`
                        : `₹${service.price}`}
                    </strong>

                    <button
                      type="button"
                      className="select-service-button"
                      onClick={() => {
                        setSelectedService(service);
                        setBooked(false);
                      }}
                    >
                      {selectedService?.worker_service_id ===
                      service.worker_service_id
                        ? "Selected ✓"
                        : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ABOUT WORKER */}
        <div className="profile-card">
          <h2>About the Worker</h2>

          <p>{selectedWorker.about}</p>

          <div className="profile-info">
            <div>
              <small>Experience</small>
              <strong>{selectedWorker.experience}</strong>
            </div>

            <div>
              <small>Location</small>
              <strong>{selectedWorker.location}</strong>
            </div>

            <div>
              <small>Rating</small>
              <strong>⭐ {selectedWorker.rating}/5</strong>
            </div>
          </div>
        </div>

        {/* BOOKING */}
        <div className="booking-card">
          {booked && (
            <div className="booking-success">
              <strong>✅ Booking request sent successfully!</strong>

              <p>🛠 Service: {selectedService?.service_name}</p>

              <p>
                💰 Service Charge: ₹{selectedService?.price}
              </p>

              <p>
                🚗 Visiting Fee: ₹{selectedService?.visiting_fee || 99}
              </p>

              <p>
                💵 Estimated Total: ₹
                {Number(selectedService?.price || 0) +
                  Number(selectedService?.visiting_fee || 99)}
              </p>

              <p>
                ⏱ Estimated time:{" "}
                {selectedService?.estimated_duration}
              </p>

              <p>📅 Date: {bookingDate}</p>

              <p>🕐 Time: {bookingTime}</p>

              <p>📍 Address: {serviceAddress}</p>

              <p>📝 Problem: {problemDescription}</p>
            </div>
          )}

          <span>Selected Service</span>

          {selectedService ? (
            <>
              <h3>{selectedService.service_name}</h3>

              <h2>
                {selectedService.pricing_type === "Starting From"
                  ? `From ₹${selectedService.price}`
                  : `₹${selectedService.price}`}
              </h2>

              <p>
                ⏱ Estimated duration:{" "}
                {selectedService.estimated_duration}
              </p>
            </>
          ) : (
            <>
              <h2>{selectedWorker.price}</h2>

              <p>Please select a service above to continue.</p>
            </>
          )}

          <form onSubmit={handleBooking}>
            {/* SERVICE ADDRESS */}
            <label>Service Address</label>

            <textarea
              placeholder="Enter the address where the service is required"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
              rows="3"
              required
            />

            {/* PROBLEM DESCRIPTION */}
            <label>Problem Description</label>

            <textarea
              placeholder="Describe the problem or work you need"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows="4"
              required
            />

            {/* DATE */}
            <label>Select Date</label>

            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />

            {/* TIME */}
            <label>Select Time</label>

            <input
              type="time"
              required
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            />

            <button className="book-button" type="submit">
              Book Worker
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfile;