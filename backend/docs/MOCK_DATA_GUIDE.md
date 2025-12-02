# 📊 Mock Data Guide

## Overview
The `mock_data_complete.sql` file provides comprehensive test data for the VaxSafe Blockchain vaccination management system. This file contains all necessary data with proper foreign key ordering for easy database initialization.

## 🎯 Purpose
- **Complete Testing Environment**: Full dataset covering all system features
- **Development**: Pre-populated data for frontend/backend development
- **Demo**: Ready-to-use data for demonstrations
- **CI/CD**: Consistent test data across environments

## 📋 Data Summary

### Master Data
- **4 Roles**: ADMIN, PATIENT, DOCTOR, CASHIER
- **30 Permissions**: Full RBAC permissions with role mappings
- **5 Centers**: Vaccination centers across Ho Chi Minh City
- **10 Vaccines**: Popular vaccines (Hexaxim, Prevenar, Rotarix, Gardasil, etc.)

### Users & Profiles
- **1 Admin**: Full system access
- **4 Patients**: With complete profiles (blood type, insurance, etc.)
- **5 Doctors**: Assigned to different centers with specializations
- **3 Cashiers**: One per major center

### Family & Relationships
- **4 Family Members**: Children linked to patient accounts

### Appointments & Records
- **6 Bookings**: Various statuses (CONFIRMED, COMPLETED, PENDING_PAYMENT)
- **10 Doctor Slots**: Available time slots for next 7 days
- **6 Appointments**: Mix of completed, scheduled, and pending
- **1 Vaccine Record**: Completed vaccination with blockchain hash

### Notifications & Content
- **3 Reminders**: Email reminders for appointments
- **2 Notification Logs**: Sent notification history
- **4 Notification Settings**: User preferences
- **3 News Articles**: Health and vaccine information

### Payments
- **6 Payment Records**: Various payment methods (BANK, CASH, PAYPAL)

## 🔐 Test Credentials

All user passwords are hashed with BCrypt: **`123456`**

### Admin Account
```
Email: admin@vaxsafe.com
Password: 123456
Role: ADMIN
```

### Patient Accounts
```
Email: nguyen.vana@gmail.com | Password: 123456 | Role: PATIENT
Email: tran.thib@gmail.com   | Password: 123456 | Role: PATIENT
Email: le.vanc@gmail.com     | Password: 123456 | Role: PATIENT
Email: pham.thid@gmail.com   | Password: 123456 | Role: PATIENT
```

### Doctor Accounts
```
Email: bs.nguyen.vane@vaxsafe.com | Password: 123456 | Center: VNVC Hoàng Văn Thụ
Email: bs.tran.thif@vaxsafe.com   | Password: 123456 | Center: VNVC Hoàng Văn Thụ
Email: bs.le.vang@vaxsafe.com     | Password: 123456 | Center: VNVC Trường Chinh
Email: bs.pham.thih@vaxsafe.com   | Password: 123456 | Center: VNVC Quận 7
Email: bs.hoang.vani@vaxsafe.com  | Password: 123456 | Center: VNVC Gò Vấp
```

### Cashier Accounts
```
Email: cashier.vo.thik@vaxsafe.com      | Password: 123456 | Center: VNVC Hoàng Văn Thụ
Email: cashier.nguyen.vanl@vaxsafe.com  | Password: 123456 | Center: VNVC Trường Chinh
Email: cashier.tran.thim@vaxsafe.com    | Password: 123456 | Center: VNVC Quận 7
```

## 🚀 Usage

### Option 1: Direct SQL Import
```bash
mysql -u username -p database_name < backend/src/main/resources/db/migration/mock_data_complete.sql
```

### Option 2: PostgreSQL Import
```bash
psql -U username -d database_name -f backend/src/main/resources/db/migration/mock_data_complete.sql
```

### Option 3: MySQL Workbench / pgAdmin
1. Open the tool
2. Connect to your database
3. Open `mock_data_complete.sql`
4. Execute the script

### Option 4: Application Startup (If configured)
The file can be picked up automatically by Flyway or Liquibase if placed in the correct migrations folder.

## 📊 Entity Relationships

### Insertion Order (FK Dependencies)
```
Level 1: roles, permissions, centers, vaccines
    ↓
Level 2: permission_role (junction table)
    ↓
Level 3: users
    ↓
Level 4: patients, doctors, cashiers, family_members
    ↓
Level 5: doctor_schedules (optional)
    ↓
Level 6: bookings
    ↓
Level 7: doctor_available_slots, appointments
    ↓
Level 8: vaccine_records
    ↓
Level 9: vaccination_reminders, notification_logs, user_notification_settings
    ↓
Level 10: news
    ↓
Level 11: payments
```

## 🔍 Key Features

### Realistic Data
- Vietnamese names and addresses
- Proper phone numbers format
- Valid email addresses
- Realistic medical data (blood types, insurance numbers)

### Complete Workflow Coverage
- **Booking Flow**: From PENDING_PAYMENT → CONFIRMED → SCHEDULED → COMPLETED
- **Doctor Scheduling**: Available slots for immediate booking
- **Family Members**: Multi-user household management
- **Notifications**: Reminder system with status tracking
- **Payments**: Multiple payment methods

### Blockchain Integration Ready
- `blockchain_identity_hash` fields populated
- `transaction_hash` for completed vaccinations
- DID (Decentralized Identifier) placeholders

## ⚠️ Important Notes

1. **Time-Sensitive Data**: Some dates use `NOW()`, `CURDATE()`, and date calculations for realistic scheduling
2. **Foreign Keys**: Data is ordered to satisfy all FK constraints
3. **Enums**: All enum values match Java entity definitions
4. **Passwords**: BCrypt hashed - do NOT use in production
5. **Images**: Cloudinary URLs are placeholders - update with actual images

## 🔧 Customization

### Adding More Data
Follow the level structure:
1. Add to appropriate level (respect FK constraints)
2. Maintain consistent naming conventions
3. Use proper enum values
4. Include timestamps (`created_at`, `updated_at`)

### Modifying Existing Data
- Update IDs carefully (FK dependencies)
- Maintain data integrity
- Test thoroughly after changes

## 📝 Data Scenarios

### Scenario 1: Patient Books for Self
```
Patient: Lê Văn C (user_id: 12)
Booking: ID 3 → Appointment ID 1 → Vaccine Record ID 1
Status: COMPLETED
Payment: ID 3 (CASH)
```

### Scenario 2: Patient Books for Family Member
```
Parent: Nguyễn Văn A (user_id: 10)
Child: Nguyễn Văn Minh (family_member_id: 1)
Booking: ID 4 → Appointment ID 4
Status: SCHEDULED
Payment: ID 4 (BANK)
```

### Scenario 3: Upcoming Appointment with Reminder
```
Patient: Nguyễn Văn A (user_id: 10)
Appointment: ID 2 (Today at 08:00)
Reminder: ID 1 (SENT yesterday)
Notification: ID 1 (Email sent)
```

## 🧪 Testing Checklist

- [ ] All users can log in
- [ ] Patients can view their appointments
- [ ] Doctors can see assigned slots
- [ ] Cashiers can process bookings
- [ ] Admin has full access
- [ ] Family member bookings work
- [ ] Payment status updates correctly
- [ ] Reminders are sent/logged
- [ ] Vaccine records are created
- [ ] News articles display

## 📚 Related Files

- **Entity Definitions**: `backend/src/main/java/com/dapp/backend/model/`
- **Database Migrations**: `backend/src/main/resources/db/migration/`
- **Clear Script**: `backend/src/main/resources/db/migration/clear-test-data.sql`

## 💡 Tips

1. **Reset Database**: Use `clear-test-data.sql` before re-importing
2. **Partial Import**: Comment out sections you don't need
3. **Auto-increment IDs**: Adjust if your DB starts from different seed
4. **Localization**: All Vietnamese text - translate if needed
5. **Scaling**: Duplicate and modify patterns for more test data

## 🆘 Troubleshooting

### FK Constraint Error
- Check insertion order
- Verify referenced IDs exist
- Review constraint definitions

### Duplicate Key Error
- Clear database first
- Check for existing data with same IDs
- Reset auto-increment sequences

### Date/Time Issues
- Verify database timezone settings
- Check NOW() function behavior
- Adjust date intervals if needed

## 📞 Support

For issues or questions about mock data:
1. Check entity definitions in model classes
2. Review FK constraints in migration files
3. Verify enum values match code
4. Test with minimal dataset first

---

**Last Updated**: January 2025  
**Compatibility**: Spring Boot 3.2.5, PostgreSQL/MySQL  
**Version**: 1.0.0
