const express = require("express");
const router = express.Router();
const bookingService = require("../services/bookingService");
const authMiddleware = require("../middleware/auth");

// All booking routes protected by JWT
router.use(authMiddleware);

/**
 * Create a new booking from Spring backend response
 * POST /api/bookings/create
 * Body should contain the complete booking response from Spring backend
 */
router.post("/create", async (req, res) => {
	try {
		const springData = req.body;

		// Validate required fields
		if (!springData.totalDoses || !springData.appointments) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: totalDoses and appointments are required",
			});
		}

		// Adapter: Transform Spring format to blockchain service format
		// New format: uses string names directly (no IDs)
		const adaptedData = {
			patient: springData.patient || springData.patientName || "",
			identityNumber: springData.identityNumber || "",
			familyMember:
				springData.familyMember || springData.familyMemberName || "",
			vaccine: springData.vaccine || springData.vaccineName || "",
			totalAmount: springData.totalAmount,
			totalDoses: springData.totalDoses,
			bookingStatus: springData.bookingStatus || "PENDING",
			paymentMethod: springData.paymentMethod || "CASH",
			appointments: springData.appointments.map((apt) => ({
				appointmentId: apt.appointmentId,
				doseNumber: apt.doseNumber,
				scheduledDate: formatDate(apt.scheduledDate),
				scheduledTime: formatTime(apt.scheduledTime),
				center: apt.center || apt.centerName || "",
				cashier: apt.cashier || "",
				doctor: apt.doctor || "",
				appointmentStatus: apt.appointmentStatus || "PENDING_SCHEDULE",
			})),
		};

		const result = await bookingService.createBooking(adaptedData);

		res.json({
			success: true,
			blockchainBookingId: result.blockchainBookingId,
			transactionHash: result.transactionHash,
			blockNumber: result.blockNumber,
			onChainAppointments: result.onChainAppointments,
			message: "Booking synced to blockchain successfully",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error syncing booking to blockchain",
			error: err.message,
		});
	}
});

/**
 * Helper function to hash string to deterministic number
 * Used for generating IDs from names when numeric IDs not provided
 */
function _hashStringToNumber(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

/**
 * Helper function to format date
 * Handles both string format and Spring LocalDate array format [year, month, day]
 */
function formatDate(date) {
	if (!date) return null;

	// If already string, return as is
	if (typeof date === "string") return date;

	// If array [year, month, day] from Spring LocalDate
	if (Array.isArray(date) && date.length >= 3) {
		const [year, month, day] = date;
		return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}

	return String(date);
}

/**
 * Helper function to format time
 * Handles both string format and Spring LocalTime array format [hour, minute, second]
 */
function formatTime(time) {
	if (!time) return null;

	// If already string, return as is
	if (typeof time === "string") return time;

	// If array [hour, minute, second?] from Spring LocalTime
	if (Array.isArray(time) && time.length >= 2) {
		const [hour, minute, second = 0] = time;
		return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
	}

	return String(time);
}

/**
 * Get all bookings from blockchain
 * GET /api/bookings
 */
router.get("/", async (_req, res) => {
	try {
		const bookings = await bookingService.getAllBookings();
		res.json({ success: true, data: bookings });
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error listing bookings",
			error: err.message,
		});
	}
});

/**
 * Get booking by transaction hash
 * GET /api/bookings/tx/:transactionHash
 */
router.get("/tx/:transactionHash", async (req, res) => {
	try {
		const { transactionHash } = req.params;
		const result =
			await bookingService.getBookingByTransactionHash(transactionHash);
		res.json({ success: true, data: result });
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error getting booking by transaction hash",
			error: err.message,
		});
	}
});

/**
 * Get booking on-chain by blockchain booking ID
 * GET /api/bookings/:blockchainBookingId
 */
router.get("/:blockchainBookingId", async (req, res) => {
	try {
		const { blockchainBookingId } = req.params;
		const onchain = await bookingService.getBookingOnChain(
			Number(blockchainBookingId),
		);
		res.json({ success: true, data: onchain });
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error getting booking from blockchain",
			error: err.message,
		});
	}
});

/**
 * Update booking status on blockchain
 * PUT /api/bookings/:blockchainBookingId/status
 * Body: { status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "PENDING" }
 */
router.put("/:blockchainBookingId/status", async (req, res) => {
	try {
		const { blockchainBookingId } = req.params;
		const { status } = req.body;

		if (!status) {
			return res
				.status(400)
				.json({ success: false, message: "Missing status field" });
		}

		const result = await bookingService.updateBookingStatus(
			Number(blockchainBookingId),
			status,
		);
		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message: "Booking status updated on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error updating booking status",
			error: err.message,
		});
	}
});

/**
 * Update appointment status on blockchain
 * PUT /api/bookings/appointments/:appointmentId/status
 * Body: { status: "PENDING_SCHEDULE" | "AWAITING_CHECKIN" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" }
 */
router.put("/appointments/:appointmentId/status", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const { status } = req.body;

		if (!status) {
			return res
				.status(400)
				.json({ success: false, message: "Missing status field" });
		}

		const result = await bookingService.updateAppointmentStatus(
			Number(appointmentId),
			status,
		);
		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message: "Appointment status updated on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error updating appointment status",
			error: err.message,
		});
	}
});

/**
 * Update appointment staff (doctor and cashier) on blockchain
 * PUT /api/bookings/appointments/:appointmentId/staff
 * Body: { doctor: "Dr. Name", cashier: "Cashier Name" }
 */
router.put("/appointments/:appointmentId/staff", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const { doctor, cashier } = req.body;

		if (!doctor && !cashier) {
			return res.status(400).json({
				success: false,
				message: "At least one of doctor or cashier is required",
			});
		}

		const result = await bookingService.updateAppointmentStaff(
			Number(appointmentId),
			doctor,
			cashier,
		);
		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message: "Appointment staff updated on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error updating appointment staff",
			error: err.message,
		});
	}
});

/**
 * Update appointment (status, doctor, cashier) on blockchain - Combined API
 * PUT /api/bookings/appointments/:appointmentId
 * Body: {
 *   status: "PENDING_SCHEDULE" | "SCHEDULED" | "COMPLETED" | "CANCELLED",
 *   doctor?: "Dr. Name",
 *   cashier?: "Cashier Name"
 * }
 * Updates all fields in one blockchain transaction
 */
router.put("/appointments/:appointmentId", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const { status, doctor, cashier } = req.body;

		if (!status) {
			return res.status(400).json({
				success: false,
				message: "Status is required",
			});
		}

		// Use the combined contract function - one transaction only
		const result = await bookingService.updateAppointment(
			Number(appointmentId),
			status,
			doctor || "",
			cashier || "",
		);

		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message: "Appointment updated on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error updating appointment",
			error: err.message,
		});
	}
});

/**
 * Mark appointment as COMPLETED
 * PUT /api/bookings/appointments/:appointmentId/completed
 * No body required - automatically sets status to COMPLETED
 */
router.put("/appointments/:appointmentId/completed", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const result = await bookingService.completeAppointment(
			Number(appointmentId),
		);

		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message: "Appointment marked as COMPLETED on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error completing appointment",
			error: err.message,
		});
	}
});

/**
 * Mark appointment as CANCELLED
 * PUT /api/bookings/appointments/:appointmentId/cancelled
 * No body required - automatically sets status to CANCELLED
 * Note: This will also cancel all FOLLOWING appointments (appointments with higher dose numbers)
 */
router.put("/appointments/:appointmentId/cancelled", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const result = await bookingService.cancelAppointment(
			Number(appointmentId),
		);

		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message:
				"Appointment marked as CANCELLED on blockchain. All following appointments (higher dose numbers) have been cancelled.",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error cancelling appointment",
			error: err.message,
		});
	}
});

/**
 * Assign staff to appointment and auto-set status to SCHEDULED
 * PUT /api/bookings/appointments/:appointmentId/assign-staff
 * Body: { doctor: "Dr. Name", cashier: "Cashier Name" }
 * Status is automatically set to SCHEDULED
 */
router.put("/appointments/:appointmentId/assign-staff", async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const { doctor, cashier } = req.body;

		if (!doctor && !cashier) {
			return res.status(400).json({
				success: false,
				message: "At least one of doctor or cashier is required",
			});
		}

		const result = await bookingService.assignStaffToAppointment(
			Number(appointmentId),
			doctor,
			cashier,
		);

		res.json({
			success: true,
			transactionHash: result.transactionHash,
			message:
				"Staff assigned and appointment status set to SCHEDULED on blockchain",
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Error assigning staff to appointment",
			error: err.message,
		});
	}
});

module.exports = router;
