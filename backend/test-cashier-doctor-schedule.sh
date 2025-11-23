#!/bin/bash

# Test Doctor Schedule API for Cashier
# This script tests the new endpoint: GET /api/v1/doctors/my-center/with-schedule

BASE_URL="http://localhost:8080"
ACCESS_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Doctor Schedule API for Cashier${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Login as Cashier
echo -e "${YELLOW}Step 1: Login as Cashier${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "cashier.d@vax.com",
        "password": "123456"
    }')

ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ Login failed!${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful!${NC}"
echo -e "${GREEN}Access Token: ${ACCESS_TOKEN:0:20}...${NC}\n"

# Step 2: Get doctors with today's schedule
echo -e "${YELLOW}Step 2: Get Doctors with Today's Schedule${NC}"
RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/doctors/my-center/with-schedule" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

DOCTOR_COUNT=$(echo $RESPONSE | grep -o '"doctorId"' | wc -l)

if [ $DOCTOR_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $DOCTOR_COUNT doctors${NC}"
    echo "$RESPONSE" | python3 -m json.tool | head -80
else
    echo -e "${RED}✗ No doctors found!${NC}"
    echo "Response: $RESPONSE"
fi

# Step 3: Get doctors with schedule for a specific date (tomorrow)
echo -e "\n${YELLOW}Step 3: Get Doctors with Schedule for Tomorrow${NC}"
TOMORROW=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v +1d +%Y-%m-%d)

RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/doctors/my-center/with-schedule?date=${TOMORROW}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

DOCTOR_COUNT=$(echo $RESPONSE | grep -o '"doctorId"' | wc -l)

if [ $DOCTOR_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $DOCTOR_COUNT doctors for ${TOMORROW}${NC}"
    
    # Extract summary info
    echo -e "\n${BLUE}Summary Information:${NC}"
    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for doctor in data[:3]:  # Show first 3 doctors
    print(f\"  - {doctor['doctorName']} ({doctor['specialization']})\")
    print(f\"    Working Hours: {doctor['workingHoursToday']}\")
    print(f\"    Available: {doctor['availableSlotsToday']}, Booked: {doctor['bookedSlotsToday']}\")
    print(f\"    Total Slots: {doctor['totalSlotsToday']}\")
    print()
" 2>/dev/null || echo "$RESPONSE" | python3 -m json.tool | head -50
else
    echo -e "${YELLOW}⚠ No doctors found for ${TOMORROW}${NC}"
    echo "Response: $RESPONSE"
fi

# Step 4: Verify response structure
echo -e "\n${YELLOW}Step 4: Verify Response Structure${NC}"
RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/doctors/my-center/with-schedule" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

HAS_DOCTOR_ID=$(echo $RESPONSE | grep -o '"doctorId"' | head -1)
HAS_DOCTOR_NAME=$(echo $RESPONSE | grep -o '"doctorName"' | head -1)
HAS_AVAILABLE_SLOTS=$(echo $RESPONSE | grep -o '"availableSlotsToday"' | head -1)
HAS_TODAY_SCHEDULE=$(echo $RESPONSE | grep -o '"todaySchedule"' | head -1)
HAS_WORKING_HOURS=$(echo $RESPONSE | grep -o '"workingHoursToday"' | head -1)

echo "Checking response fields:"
[ ! -z "$HAS_DOCTOR_ID" ] && echo -e "  ${GREEN}✓ doctorId${NC}" || echo -e "  ${RED}✗ doctorId${NC}"
[ ! -z "$HAS_DOCTOR_NAME" ] && echo -e "  ${GREEN}✓ doctorName${NC}" || echo -e "  ${RED}✗ doctorName${NC}"
[ ! -z "$HAS_AVAILABLE_SLOTS" ] && echo -e "  ${GREEN}✓ availableSlotsToday${NC}" || echo -e "  ${RED}✗ availableSlotsToday${NC}"
[ ! -z "$HAS_TODAY_SCHEDULE" ] && echo -e "  ${GREEN}✓ todaySchedule${NC}" || echo -e "  ${RED}✗ todaySchedule${NC}"
[ ! -z "$HAS_WORKING_HOURS" ] && echo -e "  ${GREEN}✓ workingHoursToday${NC}" || echo -e "  ${RED}✗ workingHoursToday${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Test Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
