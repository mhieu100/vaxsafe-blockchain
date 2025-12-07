# Medical Observation & Vitals Tracking Feature

## 1. Overview
This feature allows for comprehensive tracking of patient health metrics (vitals) and post-vaccination reactions. It bridges the gap between clinical actions (vaccination) and long-term health monitoring.

## 2. Key Capabilities

### 🏥 For Medical Staff (Doctors/Nurses)
*   **Integrated Workflow:** When completing an appointment, a standard medical workflow is triggered instead of a simple confirmation.
*   **Vitals Recording:** Capture critical metrics at the point of care:
    *   Body Weight (kg)
    *   Body Height (cm)
    *   Body Temperature (°C)
    *   Blood Pressure (mmHg)
    *   Heart Rate (bpm)
*   **Reaction Monitoring:** Record immediate post-vaccination reactions (e.g., fever, swelling, anaphylaxis) with detailed notes.
*   **Auto-Sync:** Updating specific vitals (Weight/Height) automatically updates the Patient's main profile for consistency.

### 👤 For Patients
*   **Health Dashboard:** View historical health data.
*   **Visual Charts:** Interactive line charts to track Body Weight and Height over time.
*   **Access:** Can view their own history via the "My Observations" API.

## 3. Technical Implementation

### Backend (Spring Boot)
*   **Entity:** `Observation` (linked to `Patient`).
*   **Enum:** `ObservationType` (BODY_WEIGHT, BODY_HEIGHT, BLOOD_PRESSURE, etc.).
*   **Logic:**
    *   `ObservationService.createObservationForPatient()`: Validates doctor role, saves observation, and syncs `Patient` entity weight/height.
    *   `ObservationService.getMyObservations()`: Retrieves sorted history for the logged-in user.

### Frontend (React)
*   **Doctor Dashboard:**
    *   `CompletionModal.jsx`: A 3-step wizard (Vitals -> Reactions -> Confirmation).
*   **Patient Profile:**
    *   `HealthMetricsChart.jsx`: Uses `chart.js` and `react-chartjs-2` to visualize data.
    *   Integrated into `DashboardTab.jsx`.

## 4. API Endpoints

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/observations` | Create a self-reported observation | Patient |
| `GET` | `/api/observations/me` | Get my observation history | Patient |
| `POST` | `/api/observations/patient/{id}` | Record vitals/reaction for a patient | Doctor/Staff |

## 5. Testing Flow
1.  **Doctor Action:**
    *   Login as Doctor.
    *   Select a "Scheduled" appointment -> Click "Complete".
    *   Fill in Vitals (e.g., Weight: 70kg, Height: 170cm).
    *   Submit -> System saves Observation + Updates Appointment Status.
2.  **System Verification:**
    *   Check Database: `observations` table has new records. `patients` table has updated `weight_kg`/`height_cm`.
3.  **Patient View:**
    *   Login as Patient.
    *   Navigate to Dashboard.
    *   Verify "Theo dõi sức khỏe" chart displays the new data point.
