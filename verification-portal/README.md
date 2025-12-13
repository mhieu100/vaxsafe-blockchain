# VaxSafe Verification Portal

This is the standalone frontend application for verifying VaxSafe Vaccine Records.
It allows third parties (airports, schools, venues) to scan and verify digital vaccine passports.

## Features
- **Public Verification Page**: Accessible via `/verify/:id`.
- **QR Code Display**: Generates a verifiable QR code for the record.
- **Premium UI**: Clean, trustworthy, and modern design.
- **Mock Mode**: Currently runs with mock data for easy testing.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to:
   `http://localhost:5173/verify/demo-id`

## Integration

To connect to the real backend:
1. Open `src/api/verifyApi.js`.
2. Uncomment the `axios.get` line.
3. Ensure your backend has a public endpoint at `/api/public/verify-vaccine/{id}`.
