# Booking System Improvement Documentation

## 1. Overview
This document outlines the improvements made to the VaxSafe booking system to address critical issues related to overbooking, static time slots, and the doctor assignment process.

## 2. Problem Statement
*   **Overbooking Risk:** The previous system did not check center capacity or existing appointments before confirming a new booking, leading to potential overbooking.
*   **Static Time Slots:** The frontend displayed a hardcoded list of time slots regardless of actual availability.
*   **Unassigned Doctors:** Online bookings were created without an assigned doctor, creating confusion during the check-in process.

## 3. Solution Architecture

### 3.1. Backend: Capacity Management & Validation
*   **New API Endpoint:** `GET /api/bookings/availability`
    *   **Purpose:** Returns real-time availability for a specific center and date.
    *   **Logic:** Calculates `Available = Capacity - Booked` for each time slot.
*   **Validation Logic:**
    *   Updated `BookingService.createBooking` to strictly validate slot availability before saving.
    *   Throws an exception if the selected slot is full.
*   **Database Optimization:**
    *   Added `countAppointmentsBySlot` query to `AppointmentRepository` for efficient counting.

### 3.2. Frontend: Dynamic User Interface
*   **Dynamic Slot Rendering:**
    *   The `AppointmentSection` component now fetches availability data when the user selects a Center and Date.
    *   Time slots are displayed with their real-time status (e.g., "48 spots left" or "Full").
*   **User Experience:**
    *   Fully booked slots are disabled to prevent selection.
    *   Loading states provide visual feedback during availability checks.
    *   Removed the invalid 17:00-19:00 time slot to match operating hours.

### 3.3. Operational: Doctor Assignment Workflow
*   **Workflow:**
    1.  **Booking:** Client books an appointment online (Status: `SCHEDULED`, Doctor: `NULL`).
    2.  **Check-in:** Client arrives at the center.
    3.  **Assignment:** Cashier uses the **Staff Dashboard** to view the appointment.
    4.  **Processing:** Cashier selects an available doctor via the `ProcessUrgentAppointmentModal`.
    5.  **Confirmation:** System updates the appointment with the assigned Doctor and Slot.

## 4. Technical Implementation Details

### 4.1. Data Structures
**Time Slots (TimeSlotEnum):**
*   `SLOT_07_00` (07:00 - 09:00)
*   `SLOT_09_00` (09:00 - 11:00)
*   `SLOT_11_00` (11:00 - 13:00)
*   `SLOT_13_00` (13:00 - 15:00)
*   `SLOT_15_00` (15:00 - 17:00)

**DTOs:**
*   `SlotAvailabilityDto`: Contains `timeSlot`, `capacity`, `booked`, `available`, `status`.
*   `CenterAvailabilityResponse`: Wrapper for the list of slots.

### 4.2. Key Code Changes
*   **Backend:**
    *   `AppointmentRepository.java`: Added `countAppointmentsBySlot`.
    *   `BookingService.java`: Added `checkAvailability` and validation logic.
    *   `AppointmentService.java`: Updated `updateScheduledAppointment` to handle slot assignment correctly.
*   **Frontend:**
    *   `booking.service.js`: Added `checkAvailability` API call.
    *   `AppointmentSection.jsx`: Integrated dynamic slot fetching and display.

## 5. User Guide (For Staff)

### How to Assign a Doctor to an Online Booking
1.  Log in to the **Staff Dashboard** (Cashier role).
2.  Locate the appointment in the **"Danh Sách Cần Xử Lý"** (Urgent List) or search for the patient.
3.  Click **"Xử Lý Ngay"** (Process Now).
4.  In the popup modal:
    *   Select a **Doctor** from the dropdown list.
    *   Select a **Time Slot** (the system will show available slots for that doctor).
5.  Click **"Phân công bác sĩ"** (Assign Doctor) to confirm.
