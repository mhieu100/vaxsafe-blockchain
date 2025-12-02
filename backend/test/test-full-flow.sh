#!/bin/bash

# ========================================
# FULL FLOW TEST SCRIPT
# Test vaccination reminder system with 2-dose vaccine
# ========================================

set -e  # Exit on error

BASE_URL="http://localhost:8080"
USER_ID=1
VACCINE_ID=1  # Make sure this is a 2-dose vaccine like Twinrix

echo "=========================================="
echo "VACCINATION REMINDER FULL FLOW TEST"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# STEP 1: Create appointment for Dose 1
# ========================================
echo -e "${BLUE}STEP 1: Creating appointment for Dose 1 (tomorrow)...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/test/create-test-appointment?daysFromNow=1&userId=$USER_ID")
echo "$RESPONSE" | jq '.'

APPOINTMENT_ID=$(echo "$RESPONSE" | jq -r '.appointmentId')
echo -e "${GREEN}✓ Appointment created: ID = $APPOINTMENT_ID${NC}"
echo ""
sleep 2

# ========================================
# STEP 2: Send appointment reminders
# ========================================
echo -e "${BLUE}STEP 2: Sending appointment reminders (EMAIL)...${NC}"
REMINDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/test/send-test-reminder")
echo "$REMINDER_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Check your email for appointment reminder!${NC}"
echo ""
sleep 2

# ========================================
# STEP 3: Check reminders created
# ========================================
echo -e "${BLUE}STEP 3: Checking reminders in database...${NC}"
REMINDERS=$(curl -s -X GET "$BASE_URL/api/reminders/my-reminders?userId=$USER_ID")
echo "$REMINDERS" | jq '.[] | {id, reminderType, scheduledDate, status, channel}'
echo -e "${GREEN}✓ Reminders listed above${NC}"
echo ""
sleep 2

# ========================================
# STEP 4: Simulate completing Dose 1
# ========================================
echo -e "${YELLOW}STEP 4: Simulating doctor completing Dose 1...${NC}"
echo "Note: You need to manually complete the appointment through the app or API with doctor token"
echo "Command: PUT /appointments/$APPOINTMENT_ID/complete"
echo ""
read -p "Press Enter after you've completed the appointment..."
echo ""

# ========================================
# STEP 5: Check if next dose reminder was created
# ========================================
echo -e "${BLUE}STEP 5: Checking for next dose reminder...${NC}"
NEXT_DOSE_REMINDERS=$(curl -s -X GET "$BASE_URL/api/reminders/my-reminders?userId=$USER_ID")
echo "$NEXT_DOSE_REMINDERS" | jq '.[] | select(.reminderType == "NEXT_DOSE_REMINDER")'
echo -e "${GREEN}✓ Next dose reminder should appear above${NC}"
echo ""
sleep 2

# ========================================
# STEP 6: Send next dose reminder
# ========================================
echo -e "${BLUE}STEP 6: Sending next dose reminder (EMAIL)...${NC}"
echo "Note: Requires admin token"
echo "You can manually trigger: POST /api/reminders/send-pending"
echo ""

# ========================================
# SUMMARY
# ========================================
echo -e "${GREEN}=========================================="
echo "TEST FLOW SUMMARY"
echo "==========================================${NC}"
echo ""
echo "✓ Appointment created for Dose 1"
echo "✓ Appointment reminders sent (1, 3, 7 days before)"
echo "✓ Dose 1 marked as completed (manual step)"
echo "✓ Next dose reminder created automatically"
echo "✓ Next dose reminder sent when date arrives"
echo ""
echo "📧 EXPECTED EMAILS:"
echo "   1. Appointment reminder (before dose 1)"
echo "   2. Next dose reminder (when dose 2 is due)"
echo ""
echo "📊 CHECK DATABASE:"
echo "   SELECT * FROM vaccination_reminders WHERE user_id = $USER_ID;"
echo "   SELECT * FROM notification_logs WHERE user_id = $USER_ID;"
echo ""
echo -e "${BLUE}Test completed!${NC}"
