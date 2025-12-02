-- ================================================================================================
-- COMPREHENSIVE MOCK DATA FOR VAXSAFE BLOCKCHAIN SYSTEM
-- ================================================================================================
-- This file provides complete mock data for testing the VaxSafe vaccination management system.
-- Data is ordered to respect all foreign key constraints.
-- All passwords are hashed with BCrypt: "123456"
-- ================================================================================================

-- ================================================================================================
-- LEVEL 1: MASTER DATA (No FK Dependencies)
-- ================================================================================================

-- ========================
-- Roles
-- ========================
INSERT INTO roles (id, name) VALUES
(1, 'ADMIN'),
(2, 'PATIENT'),
(3, 'DOCTOR'),
(4, 'CASHIER');

-- ========================
-- Permissions
-- ========================
INSERT INTO permissions (id, name, api_path, method, module) VALUES
(1, 'Get all appointments of center', '/appointments', 'GET', 'APPOINTMENT'),
(2, 'Update a appointment of cashier', '/appointments/{id}', 'PUT', 'APPOINTMENT'),
(3, 'Cancel a appointment', '/appointments/{id}/cancel', 'PUT', 'APPOINTMENT'),
(4, 'Complete a appointment', '/appointments/{id}/complete', 'PUT', 'APPOINTMENT'),
(5, 'Create appointments with cash', '/appointments/cash', 'POST', 'APPOINTMENT'),
(6, 'Create appointments with credit card', '/appointments/credit-card', 'POST', 'APPOINTMENT'),
(7, 'Update status of payment', '/appointments/update-payment', 'POST', 'APPOINTMENT'),
(8, 'Get all appointments of doctor', '/appointments/my-schedule', 'GET', 'APPOINTMENT'),
(9, 'Access profile', '/auth/account', 'GET', 'AUTH'),
(10, 'Get all appointments of user', '/auth/my-appointments', 'GET', 'AUTH'),
(11, 'Create a center', '/centers', 'POST', 'CENTER'),
(12, 'Get a center by id', '/centers/{id}', 'GET', 'CENTER'),
(13, 'Update a center', '/centers/{id}', 'PUT', 'CENTER'),
(14, 'Delete a center', '/centers/{id}', 'DELETE', 'CENTER'),
(15, 'Create a vaccine', '/vaccines', 'POST', 'VACCINE'),
(16, 'Get a vaccine by id', '/vaccines/{id}', 'GET', 'VACCINE'),
(17, 'Update a vaccine', '/vaccines/{id}', 'PUT', 'VACCINE'),
(18, 'Delete a vaccine', '/vaccines/{id}', 'DELETE', 'VACCINE'),
(19, 'Create a permission', '/permissions', 'POST', 'PERMISSION'),
(20, 'Get all permissions', '/permissions', 'GET', 'PERMISSION'),
(21, 'Update a permission', '/permissions', 'PUT', 'PERMISSION'),
(22, 'Delete a permission', '/permissions/{id}', 'DELETE', 'PERMISSION'),
(23, 'Update a user', '/users/{walletAddress}', 'PUT', 'USER'),
(24, 'Delete a user', '/users/{walletAddress}', 'DELETE', 'USER'),
(25, 'Get all users', '/users', 'GET', 'USER'),
(26, 'Get all doctors of center', '/users/doctors', 'GET', 'USER'),
(27, 'Get all roles', '/roles', 'GET', 'ROLE'),
(28, 'Update a role', '/roles/{id}', 'PUT', 'ROLE'),
(29, 'Upload a file', '/files', 'POST', 'FILE'),
(30, 'Get all appointment', '/appointments/all', 'GET', 'APPOINTMENT');

-- ========================
-- Centers
-- ========================
INSERT INTO centers (center_id, name, slug, address, phone_number, capacity, working_hours, image, created_at, updated_at, is_deleted) VALUES
(1, 'VNVC Hoàng Văn Thụ', 'vnvc-hoang-van-thu', '198 Hoàng Văn Thụ, P. 9, Q. Phú Nhuận, TP.HCM', '02871026595', 100, '07:30 - 17:00', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/center/center1.jpg', NOW(), NOW(), false),
(2, 'VNVC Trường Chinh', 'vnvc-truong-chinh', '12 Trường Chinh, P. 4, Q. Tân Bình, TP.HCM', '02871026596', 120, '07:30 - 17:00', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/center/center2.jpg', NOW(), NOW(), false),
(3, 'VNVC Quận 7', 'vnvc-quan-7', 'Lô F1-01, 19 Đ. số 1, Tân Phong, Q. 7, TP.HCM', '02871026597', 80, '08:00 - 17:00', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/center/center3.jpg', NOW(), NOW(), false),
(4, 'VNVC Gò Vấp', 'vnvc-go-vap', '1 Quang Trung, P. 10, Q. Gò Vấp, TP.HCM', '02871026598', 90, '07:30 - 17:00', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/center/center4.jpg', NOW(), NOW(), false),
(5, 'VNVC Thủ Đức', 'vnvc-thu-duc', '240 Võ Văn Ngân, P. Bình Thọ, TP. Thủ Đức, TP.HCM', '02871026599', 110, '07:30 - 17:00', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/center/center5.jpg', NOW(), NOW(), false);

-- ========================
-- Vaccines
-- ========================
INSERT INTO vaccines (id, slug, name, country, manufacturer, price, stock, doses_required, duration, description_short, description, injection, preserve, contraindications, image, created_at, updated_at, is_deleted) VALUES
(1, 'hexaxim-6-trong-1', 'Hexaxim (6 trong 1)', 'Pháp', 'Sanofi Pasteur', 1100000, 200, 3, 24, 'Vắc xin 6 trong 1 phòng: Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib', 'Vắc xin Hexaxim là vắc xin kết hợp phòng được 6 loại bệnh trong 1 mũi tiêm: Ho gà, bạch hầu, uốn ván, bại liệt, viêm gan B và Hib', '["Tiêm bắp tại mặt trước-ngoài đùi (trẻ nhỏ) hoặc vùng cơ delta (trẻ >15 tháng)"]', '["Bảo quản 2-8°C, không đông băng"]', '["Dị ứng với thành phần vắc xin","Bệnh não tiến triển","Phản ứng quá mẫn với mũi tiêm trước"]', 'https://vnvc.vn/wp-content/uploads/2018/06/vacxin-hexaxim.jpg', NOW(), NOW(), false),
(2, 'prevenar-13', 'Prevenar 13', 'Bỉ', 'Pfizer', 1200000, 150, 3, 24, 'Vắc xin phòng phế cầu 13 giá: viêm phổi, viêm màng não, viêm tai giữa', 'Vắc xin Prevenar 13 phòng các bệnh do 13 chủng vi khuẩn phế cầu gây ra', '["Tiêm bắp tại vùng cơ delta"]', '["Bảo quản 2-8°C, không đông băng"]', '["Quá mẫn với thành phần vắc xin hoặc độc tố bạch hầu"]', 'https://vnvc.vn/wp-content/uploads/2019/11/prevenar-13.jpg', NOW(), NOW(), false),
(3, 'rotarix', 'Rotarix', 'Bỉ', 'GlaxoSmithKline', 850000, 180, 2, 12, 'Vắc xin uống phòng tiêu chảy do Rotavirus', 'Vắc xin Rotarix phòng viêm dạ dày-ruột do Rotavirus, uống trực tiếp', '["Dùng đường uống, không tiêm"]', '["Bảo quản 2-8°C, sau hoàn nguyên dùng trong 24h"]', '["Dị ứng thành phần vắc xin","Dị tật đường tiêu hóa bẩm sinh","Tiền sử lồng ruột"]', 'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-rotarix.jpg', NOW(), NOW(), false),
(4, 'varilrix', 'Varilrix', 'Bỉ', 'GlaxoSmithKline', 950000, 160, 2, 24, 'Vắc xin phòng bệnh thủy đậu', 'Vắc xin Varilrix phòng bệnh thủy đậu do virus Varicella Zoster', '["Tiêm dưới da tại vùng cơ delta hoặc má ngoài đùi"]', '["Bảo quản 2-8°C"]', '["Suy giảm miễn dịch nghiêm trọng","Thai kỳ","Sốt cao cấp tính"]', 'https://vnvc.vn/wp-content/uploads/2021/01/vac-xin-varilrix.jpg', NOW(), NOW(), false),
(5, 'mmr-ii', 'MMR II', 'Mỹ', 'Merck Sharp & Dohme', 780000, 190, 2, 24, 'Vắc xin phòng 3 bệnh: Sởi, Quai bị, Rubella', 'Vắc xin MMR-II phòng sởi, quai bị và rubella', '["Tiêm dưới da, không tiêm tĩnh mạch"]', '["Bảo quản 2-8°C, tránh ánh sáng"]', '["Dị ứng với gelatin, neomycin","Thai kỳ","Suy giảm miễn dịch","Bệnh lao đang tiến triển"]', 'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-MMR-II.jpg', NOW(), NOW(), false),
(6, 'gardasil-9', 'Gardasil 9', 'Mỹ', 'Merck Sharp & Dohme', 2100000, 120, 3, 12, 'Vắc xin phòng ung thư cổ tử cung và các bệnh do HPV', 'Vắc xin Gardasil 9 phòng 9 tuýp virus HPV gây ung thư và mụn cóc sinh dục', '["Tiêm bắp tại vùng cơ delta hoặc đùi"]', '["Bảo quản 2-8°C, không đông băng"]', '["Dị ứng với thành phần vắc xin"]', 'https://vnvc.vn/wp-content/uploads/2022/05/vacxin-gardasil-9.jpg', NOW(), NOW(), false),
(7, 'vaxigrip-tetra', 'Vaxigrip Tetra', 'Pháp', 'Sanofi Pasteur', 550000, 250, 1, 12, 'Vắc xin cúm 4 giá phòng 4 chủng virus cúm A và B', 'Vắc xin cúm Tứ giá Vaxigrip Tetra phòng 4 chủng cúm A (H1N1, H3N2) và cúm B', '["Tiêm bắp hoặc tiêm dưới da"]', '["Bảo quản 2-8°C, không đông băng, tránh ánh sáng"]', '["Quá mẫn với trứng, protein gà, neomycin","Sốt cao hoặc bệnh cấp tính"]', 'https://vnvc.vn/wp-content/uploads/2021/07/vaccine-vaxigrip-tetra.jpg', NOW(), NOW(), false),
(8, 'engerix-b', 'Engerix B', 'Bỉ', 'GlaxoSmithKline', 320000, 300, 3, 24, 'Vắc xin phòng viêm gan B', 'Vắc xin Engerix B phòng bệnh do virus viêm gan B', '["Tiêm bắp tại vùng cơ delta"]', '["Bảo quản 2-8°C, không đông băng"]', '["Quá mẫn với thành phần vắc xin"]', 'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-engerix-b.jpg', NOW(), NOW(), false),
(9, 'verorab', 'Verorab', 'Pháp', 'Sanofi Pasteur', 420000, 140, 5, 1, 'Vắc xin phòng bệnh dại', 'Vắc xin Verorab phòng bệnh dại sau tiếp xúc hoặc bị động vật nghi dại cắn', '["Tiêm bắp tại vùng cơ delta (người lớn) hoặc đùi (trẻ nhỏ)"]', '["Bảo quản 2-8°C"]', '["Không tiêm trong da cho người dùng thuốc ức chế miễn dịch, chloroquin"]', 'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-verorab-1.jpg', NOW(), NOW(), false),
(10, 'pentaxim', 'Pentaxim (5 trong 1)', 'Pháp', 'Sanofi Pasteur', 850000, 220, 3, 24, 'Vắc xin 5 trong 1 phòng: Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', 'Vắc xin Pentaxim phòng 5 loại bệnh trong 1 mũi tiêm', '["Tiêm bắp tại mặt trước-bên đùi"]', '["Bảo quản 2-8°C, không đông băng"]', '["Dị ứng thành phần vắc xin","Bệnh não tiến triển"]', 'https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-pentaxim-1.jpg', NOW(), NOW(), false);

-- ================================================================================================
-- LEVEL 2: PERMISSION-ROLE MAPPING
-- ================================================================================================
INSERT INTO permission_role (role_id, permission_id) VALUES
-- ADMIN: All permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20),
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), (1, 27), (1, 28), (1, 29), (1, 30),
-- PATIENT: Basic permissions
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 29), (2, 30),
-- DOCTOR: Doctor-specific permissions
(3, 1), (3, 2), (3, 4), (3, 8), (3, 9), (3, 12), (3, 16), (3, 29),
-- CASHIER: Cashier-specific permissions  
(4, 1), (4, 2), (4, 5), (4, 7), (4, 9), (4, 27), (4, 28), (4, 29);

-- ================================================================================================
-- LEVEL 3: USERS
-- ================================================================================================
INSERT INTO users (id, email, full_name, password, refresh_token, phone, gender, birthday, address, avatar, role_id, is_deleted, is_active) VALUES
-- Admin
(1, 'admin@vaxsafe.com', 'Quản trị viên', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0901234567', 'MALE', '1985-01-15', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/admin.jpg', 1, false, true),

-- Patients (role_id = 2)
(10, 'nguyen.vana@gmail.com', 'Nguyễn Văn A', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0912345001', 'MALE', '1990-05-20', '123 Nguyễn Huệ, Q.1, TP.HCM', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/patient1.jpg', 2, false, true),
(11, 'tran.thib@gmail.com', 'Trần Thị B', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0912345002', 'FEMALE', '1992-08-15', '456 Lê Lợi, Q.1, TP.HCM', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/patient2.jpg', 2, false, true),
(12, 'le.vanc@gmail.com', 'Lê Văn C', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0912345003', 'MALE', '1988-03-10', '789 Hai Bà Trưng, Q.3, TP.HCM', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/patient3.jpg', 2, false, true),
(13, 'pham.thid@gmail.com', 'Phạm Thị D', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0912345004', 'FEMALE', '1995-11-25', '321 Pasteur, Q.3, TP.HCM', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/patient4.jpg', 2, false, true),

-- Doctors (role_id = 3)
(20, 'bs.nguyen.vane@vaxsafe.com', 'BS. Nguyễn Văn E', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0923456001', 'MALE', '1980-02-14', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/doctor1.jpg', 3, false, true),
(21, 'bs.tran.thif@vaxsafe.com', 'BS. Trần Thị F', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0923456002', 'FEMALE', '1982-07-22', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/doctor2.jpg', 3, false, true),
(22, 'bs.le.vang@vaxsafe.com', 'BS. Lê Văn G', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0923456003', 'MALE', '1979-12-05', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/doctor3.jpg', 3, false, true),
(23, 'bs.pham.thih@vaxsafe.com', 'BS. Phạm Thị H', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0923456004', 'FEMALE', '1985-04-18', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/doctor4.jpg', 3, false, true),
(24, 'bs.hoang.vani@vaxsafe.com', 'BS. Hoàng Văn I', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0923456005', 'MALE', '1983-09-30', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/doctor5.jpg', 3, false, true),

-- Cashiers (role_id = 4)
(30, 'cashier.vo.thik@vaxsafe.com', 'Võ Thị K', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0934567001', 'FEMALE', '1993-06-12', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/cashier1.jpg', 4, false, true),
(31, 'cashier.nguyen.vanl@vaxsafe.com', 'Nguyễn Văn L', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0934567002', 'MALE', '1994-03-25', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/cashier2.jpg', 4, false, true),
(32, 'cashier.tran.thim@vaxsafe.com', 'Trần Thị M', '$2a$10$khUSAS5S7gXcMMG6pwIPCeo5raxxdJggD/3fnKwjVTRFaBLD.TIIG', NULL, '0934567003', 'FEMALE', '1991-11-08', 'TP. Hồ Chí Minh', 'https://res.cloudinary.com/dcwzhi4tp/image/upload/v1732000000/user/cashier3.jpg', 4, false, true);

-- ================================================================================================
-- LEVEL 4: USER PROFILES & FAMILY MEMBERS
-- ================================================================================================

-- Patients
INSERT INTO patients (id, user_id, identity_number, blood_type, height_cm, weight_kg, occupation, insurance_number, consent_for_ai_analysis) VALUES
(1, 10, '001090012345', 'O', 175.5, 70.0, 'Kỹ sư phần mềm', 'BHYT001090012345', true),
(2, 11, '001092054321', 'A', 162.0, 55.0, 'Giáo viên', 'BHYT001092054321', true),
(3, 12, '001088098765', 'B', 170.0, 68.0, 'Nhân viên văn phòng', 'BHYT001088098765', false),
(4, 13, '001095123456', 'AB', 158.0, 52.0, 'Y tá', 'BHYT001095123456', true);

-- Doctors
INSERT INTO doctors (doctor_id, user_id, center_id, license_number, specialization, consultation_duration, max_patients_per_day, is_available, created_at, updated_at) VALUES
(1, 20, 1, 'BYT-2020-001', 'Tiêm chủng tổng hợp', 30, 20, true, NOW(), NOW()),
(2, 21, 1, 'BYT-2020-002', 'Tiêm chủng trẻ em', 30, 20, true, NOW(), NOW()),
(3, 22, 2, 'BYT-2020-003', 'Tiêm chủng người lớn', 30, 20, true, NOW(), NOW()),
(4, 23, 3, 'BYT-2020-004', 'Tiêm chủng tổng hợp', 30, 20, true, NOW(), NOW()),
(5, 24, 4, 'BYT-2020-005', 'Tiêm chủng trẻ em', 30, 20, true, NOW(), NOW());

-- Cashiers
INSERT INTO cashiers (cashier_id, user_id, center_id, employee_code, shift_start_time, shift_end_time, is_active, created_at, updated_at) VALUES
(1, 30, 1, 'CS-001', '07:30', '15:30', true, NOW(), NOW()),
(2, 31, 2, 'CS-002', '07:30', '15:30', true, NOW(), NOW()),
(3, 32, 3, 'CS-003', '07:30', '15:30', true, NOW(), NOW());

-- Family Members
INSERT INTO family_members (id, user_id, full_name, date_of_birth, relationship, phone, identity_number, gender, blockchain_identity_hash) VALUES
(1, 10, 'Nguyễn Văn Minh', '2018-03-15', 'Con trai', '0912345001', '001018123456', 'MALE', '0xabc123def456family001'),
(2, 10, 'Nguyễn Thị Lan', '2020-08-20', 'Con gái', '0912345001', '001020456789', 'FEMALE', '0xabc123def456family002'),
(3, 11, 'Trần Văn Nam', '2019-12-10', 'Con trai', '0912345002', '001019789012', 'MALE', '0xdef456abc789family003'),
(4, 12, 'Lê Thị Hương', '2017-05-25', 'Con gái', '0912345003', '001017345678', 'FEMALE', '0xghi789jkl012family004');

-- ================================================================================================
-- LEVEL 5: DOCTOR SCHEDULES (Optional)
-- ================================================================================================
-- Example: Doctor 1 works Monday to Friday, 7:30-11:30 and 13:00-17:00
INSERT INTO doctor_schedules (schedule_id, doctor_id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
-- Doctor 1 - Center 1
(1, 1, 1, '07:30:00', '11:30:00', true, NOW(), NOW()), -- Monday morning
(2, 1, 1, '13:00:00', '17:00:00', true, NOW(), NOW()), -- Monday afternoon
(3, 1, 2, '07:30:00', '11:30:00', true, NOW(), NOW()), -- Tuesday morning
(4, 1, 2, '13:00:00', '17:00:00', true, NOW(), NOW()), -- Tuesday afternoon
(5, 1, 3, '07:30:00', '11:30:00', true, NOW(), NOW()), -- Wednesday morning
(6, 1, 3, '13:00:00', '17:00:00', true, NOW(), NOW()), -- Wednesday afternoon
-- Doctor 2 - Center 1
(7, 2, 1, '07:30:00', '11:30:00', true, NOW(), NOW()),
(8, 2, 2, '07:30:00', '11:30:00', true, NOW(), NOW()),
(9, 2, 3, '07:30:00', '11:30:00', true, NOW(), NOW());

-- ================================================================================================
-- LEVEL 6: BOOKINGS
-- ================================================================================================
INSERT INTO bookings (booking_id, patient_id, family_member_id, vaccine_id, total_doses, total_amount, status, created_at) VALUES
-- Patient direct bookings
(1, 10, NULL, 1, 3, 3300000, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 11, NULL, 5, 2, 1560000, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 12, NULL, 7, 1, 550000, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 10 DAY)),
-- Family member bookings
(4, 10, 1, 1, 3, 3300000, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 10, 2, 5, 2, 1560000, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 11, 3, 10, 3, 2550000, 'PENDING_PAYMENT', NOW());

-- ================================================================================================
-- LEVEL 7: DOCTOR AVAILABLE SLOTS & APPOINTMENTS
-- ================================================================================================

-- Doctor Available Slots (for next 7 days)
INSERT INTO doctor_available_slots (slot_id, doctor_id, slot_date, start_time, end_time, status, appointment_id, created_at, updated_at) VALUES
-- Today's slots for Doctor 1
(1, 1, CURDATE(), '07:30:00', '08:00:00', 'BOOKED', NULL, NOW(), NOW()),
(2, 1, CURDATE(), '08:00:00', '08:30:00', 'BOOKED', NULL, NOW(), NOW()),
(3, 1, CURDATE(), '08:30:00', '09:00:00', 'AVAILABLE', NULL, NOW(), NOW()),
(4, 1, CURDATE(), '09:00:00', '09:30:00', 'AVAILABLE', NULL, NOW(), NOW()),
-- Tomorrow's slots for Doctor 1
(5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', '08:00:00', 'AVAILABLE', NULL, NOW(), NOW()),
(6, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '08:30:00', 'AVAILABLE', NULL, NOW(), NOW()),
-- Today's slots for Doctor 2
(7, 2, CURDATE(), '07:30:00', '08:00:00', 'AVAILABLE', NULL, NOW(), NOW()),
(8, 2, CURDATE(), '08:00:00', '08:30:00', 'AVAILABLE', NULL, NOW(), NOW()),
-- Future slots for Doctor 3
(9, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '07:30:00', '08:00:00', 'AVAILABLE', NULL, NOW(), NOW()),
(10, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '08:30:00', 'AVAILABLE', NULL, NOW(), NOW());

-- Appointments
INSERT INTO appointments (id, booking_id, cashier_id, doctor_id, slot_id, center_id, dose_number, scheduled_date, actual_scheduled_time, status, created_at, updated_at, is_deleted) VALUES
-- Completed appointments
(1, 3, 30, 20, 1, 1, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '07:30:00', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), false),
-- Scheduled appointments  
(2, 1, 30, 20, 2, 1, 1, CURDATE(), '08:00:00', 'SCHEDULED', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(), false),
(3, 2, 30, 21, 7, 1, 1, CURDATE(), '07:30:00', 'SCHEDULED', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), false),
(4, 4, 30, 20, 5, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', 'SCHEDULED', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), false),
(5, 5, 30, 21, 6, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', 'SCHEDULED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), false),
-- Pending appointment
(6, 6, NULL, NULL, NULL, NULL, 1, NULL, NULL, 'PENDING', NOW(), NOW(), false);

-- ================================================================================================
-- LEVEL 8: VACCINE RECORDS
-- ================================================================================================
INSERT INTO vaccine_records (id, user_id, family_member_id, patient_name, vaccine_id, dose_number, lot_number, vaccination_date, site, doctor_id, center_id, appointment_id, transaction_hash, is_verified, created_at, updated_at, is_deleted) VALUES
-- Completed vaccination record
(1, 12, NULL, 'Lê Văn C', 7, 1, 'VXGT-202311-001', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'LEFT_ARM', 20, 1, 1, '0x123abc456def789vac001', true, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), false);

-- ================================================================================================
-- LEVEL 9: REMINDERS & NOTIFICATIONS
-- ================================================================================================

-- Vaccination Reminders
INSERT INTO vaccination_reminders (id, appointment_id, user_id, reminder_type, channel, scheduled_date, status, days_before, recipient_email, created_at, updated_at, is_deleted) VALUES
(1, 2, 10, 'APPOINTMENT_REMINDER', 'EMAIL', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'SENT', 1, 'nguyen.vana@gmail.com', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), false),
(2, 3, 11, 'APPOINTMENT_REMINDER', 'EMAIL', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'SENT', 1, 'tran.thib@gmail.com', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), false),
(3, 4, 10, 'APPOINTMENT_REMINDER', 'EMAIL', CURDATE(), 'PENDING', 1, 'nguyen.vana@gmail.com', NOW(), NOW(), false);

-- Notification Logs
INSERT INTO notification_logs (id, user_id, appointment_id, reminder_type, channel, status, sent_at, recipient, content, created_at, updated_at, is_deleted) VALUES
(1, 10, 2, 'APPOINTMENT_REMINDER', 'EMAIL', 'SENT', DATE_SUB(NOW(), INTERVAL 1 DAY), 'nguyen.vana@gmail.com', 'Nhắc nhở: Bạn có lịch tiêm chủng vào ngày mai lúc 08:00', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), false),
(2, 11, 3, 'APPOINTMENT_REMINDER', 'EMAIL', 'SENT', DATE_SUB(NOW(), INTERVAL 1 DAY), 'tran.thib@gmail.com', 'Nhắc nhở: Bạn có lịch tiêm chủng vào ngày mai lúc 07:30', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), false);

-- User Notification Settings
INSERT INTO user_notification_settings (id, user_id, email_enabled, sms_enabled, zalo_enabled, preferred_channel, appointment_reminder_enabled, next_dose_reminder_enabled, created_at, updated_at, is_deleted) VALUES
(1, 10, true, false, false, 'EMAIL', true, true, NOW(), NOW(), false),
(2, 11, true, false, false, 'EMAIL', true, true, NOW(), NOW(), false),
(3, 12, true, false, false, 'EMAIL', true, true, NOW(), NOW(), false),
(4, 13, true, false, false, 'EMAIL', true, true, NOW(), NOW(), false);

-- ================================================================================================
-- LEVEL 10: NEWS CONTENT
-- ================================================================================================
INSERT INTO news (id, slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted) VALUES
(1, 'tiem-chung-day-du-cho-tre', 'Tầm quan trọng của tiêm chủng đầy đủ cho trẻ em', 'Tiêm chủng đầy đủ giúp bảo vệ trẻ khỏi các bệnh nguy hiểm', '<h2>Tại sao cần tiêm chủng đầy đủ?</h2><p>Tiêm chủng là biện pháp phòng bệnh hiệu quả nhất cho trẻ em...</p>', 'CHILDREN_HEALTH', 'BS. Nguyễn Văn E', 245, true, true, DATE_SUB(NOW(), INTERVAL 3 DAY), 'tiêm chủng,trẻ em,sức khỏe', 'VNVC', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), false),
(2, 'vaccine-phong-cum-2024', 'Vắc xin phòng cúm mùa 2024', 'Thông tin về vắc xin cúm mùa năm 2024', '<h2>Vắc xin cúm 2024</h2><p>WHO đã công bố thành phần vắc xin cúm cho năm 2024...</p>', 'VACCINE_INFO', 'BS. Trần Thị F', 189, true, true, DATE_SUB(NOW(), INTERVAL 1 DAY), 'cúm,vaccine,phòng bệnh', 'Bộ Y tế', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), false),
(3, 'phong-ngua-benh-tay-chan-mieng', 'Cách phòng ngừa bệnh tay chân miệng hiệu quả', 'Hướng dẫn phòng ngừa bệnh tay chân miệng cho trẻ nhỏ', '<h2>Bệnh tay chân miệng</h2><p>Bệnh tay chân miệng là bệnh truyền nhiễm phổ biến ở trẻ...</p>', 'DISEASE_PREVENTION', 'BS. Lê Văn G', 312, false, true, NOW(), 'tay chân miệng,phòng bệnh,trẻ em', 'Viện Pasteur', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), false);

-- ================================================================================================
-- LEVEL 11: PAYMENTS
-- ================================================================================================
INSERT INTO payments (id, reference_id, reference_type, method, amount, currency, status) VALUES
(1, 1, 'APPOINTMENT', 'BANK', 3300000, 'VND', 'SUCCESS'),
(2, 2, 'APPOINTMENT', 'BANK', 1560000, 'VND', 'SUCCESS'),
(3, 3, 'APPOINTMENT', 'CASH', 550000, 'VND', 'SUCCESS'),
(4, 4, 'APPOINTMENT', 'BANK', 3300000, 'VND', 'SUCCESS'),
(5, 5, 'APPOINTMENT', 'PAYPAL', 1560000, 'VND', 'SUCCESS'),
(6, 6, 'APPOINTMENT', 'BANK', 2550000, 'VND', 'INITIATED');

-- ================================================================================================
-- END OF MOCK DATA
-- ================================================================================================
-- Summary:
-- - 4 Roles (Admin, Patient, Doctor, Cashier)
-- - 30 Permissions with role mappings
-- - 5 Vaccination Centers
-- - 10 Popular Vaccines
-- - 13 Users (1 Admin, 4 Patients, 5 Doctors, 3 Cashiers)
-- - 4 Patient profiles
-- - 5 Doctor profiles
-- - 3 Cashier profiles  
-- - 4 Family members
-- - 6 Bookings (various statuses)
-- - 10 Doctor available slots
-- - 6 Appointments (completed, scheduled, pending)
-- - 1 Vaccine record
-- - 3 Vaccination reminders
-- - 2 Notification logs
-- - 4 User notification settings
-- - 3 News articles
-- - 6 Payment records
-- ================================================================================================
