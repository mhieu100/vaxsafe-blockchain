-- Seed sample news data for testing

-- Health General News
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('10-thoi-quen-tot-cho-suc-khoe',
 '10 Thói quen tốt cho sức khỏe mỗi ngày',
 'Khám phá 10 thói quen đơn giản nhưng hiệu quả giúp bạn duy trì sức khỏe tốt mỗi ngày',
 '<h2>Giới thiệu</h2><p>Sức khỏe là tài sản quý giá nhất của con người. Dưới đây là 10 thói quen đơn giản bạn nên thực hiện hàng ngày.</p><h3>1. Uống đủ nước</h3><p>Uống ít nhất 2 lít nước mỗi ngày giúp cơ thể hoạt động tốt hơn.</p><h3>2. Tập thể dục đều đặn</h3><p>Ít nhất 30 phút mỗi ngày giúp cơ thể khỏe mạnh.</p><h3>3. Ngủ đủ giấc</h3><p>7-8 tiếng ngủ mỗi đêm rất quan trọng.</p><h3>4. Ăn nhiều rau xanh</h3><p>Bổ sung vitamin và chất xơ từ rau củ.</p><h3>5. Hạn chế đường và muối</h3><p>Giảm nguy cơ bệnh tim mạch và tiểu đường.</p>',
 'HEALTH_GENERAL',
 'BS. Nguyễn Văn An',
 150,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '2 days',
 'sức khỏe,thói quen,phòng bệnh',
 'Bộ Y tế',
 CURRENT_TIMESTAMP - INTERVAL '3 days',
 CURRENT_TIMESTAMP - INTERVAL '2 days',
 false);

-- Vaccine Info
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('loi-ich-cua-vaccine-covid-19',
 'Lợi ích của Vaccine COVID-19 đối với sức khỏe cộng đồng',
 'Vaccine COVID-19 không chỉ bảo vệ bản thân mà còn góp phần bảo vệ cộng đồng khỏi đại dịch',
 '<h2>Vaccine COVID-19 - Vũ khí chống đại dịch</h2><p>Vaccine COVID-19 đã được chứng minh là an toàn và hiệu quả trong việc phòng ngừa bệnh nặng và tử vong do COVID-19.</p><h3>Lợi ích cá nhân</h3><ul><li>Giảm nguy cơ mắc bệnh nặng</li><li>Giảm tỷ lệ tử vong</li><li>Giảm nguy cơ biến chứng sau COVID-19</li></ul><h3>Lợi ích cộng đồng</h3><ul><li>Giảm tốc độ lây lan</li><li>Bảo vệ người yếu thế</li><li>Phục hồi kinh tế xã hội</li></ul>',
 'VACCINE_INFO',
 'PGS.TS Trần Thị Hoa',
 320,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '1 day',
 'covid-19,vaccine,phòng bệnh,cộng đồng',
 'Viện Vệ sinh Dịch tễ Trung ương',
 CURRENT_TIMESTAMP - INTERVAL '2 days',
 CURRENT_TIMESTAMP - INTERVAL '1 day',
 false);

INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('lich-tiem-chung-cho-tre-em',
 'Lịch tiêm chủng mở rộng cho trẻ em theo khuyến cáo của Bộ Y tế',
 'Hướng dẫn chi tiết về lịch tiêm chủng đầy đủ cho trẻ từ 0-18 tháng tuổi',
 '<h2>Lịch tiêm chủng mở rộng</h2><p>Chương trình tiêm chủng mở rộng là chương trình quốc gia nhằm bảo vệ trẻ em khỏi các bệnh truyền nhiễm nguy hiểm.</p><h3>Các mũi tiêm quan trọng</h3><table><tr><th>Tuổi</th><th>Loại vaccine</th></tr><tr><td>Sơ sinh</td><td>BCG, Viêm gan B</td></tr><tr><td>2 tháng</td><td>5 trong 1, Rotavirus</td></tr><tr><td>4 tháng</td><td>5 trong 1 (nhắc lại)</td></tr><tr><td>6 tháng</td><td>5 trong 1 (nhắc lại)</td></tr><tr><td>9 tháng</td><td>Sởi</td></tr><tr><td>18 tháng</td><td>Sởi, Viêm não Nhật Bản</td></tr></table>',
 'VACCINATION_SCHEDULE',
 'BS. Lê Văn Minh',
 280,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '3 days',
 'tiêm chủng,trẻ em,vaccine,lịch tiêm',
 'Bộ Y tế',
 CURRENT_TIMESTAMP - INTERVAL '4 days',
 CURRENT_TIMESTAMP - INTERVAL '3 days',
 false);

-- Disease Prevention
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('phong-ngua-cum-mua-dong',
 'Cách phòng ngừa bệnh cúm mùa hiệu quả trong mùa đông',
 'Những biện pháp đơn giản nhưng hiệu quả để phòng tránh bệnh cúm mùa',
 '<h2>Bệnh cúm mùa và cách phòng ngừa</h2><p>Cúm mùa là bệnh truyền nhiễm đường hô hấp thường xuất hiện vào mùa đông.</p><h3>Triệu chứng</h3><ul><li>Sốt cao đột ngột</li><li>Ho, đau họng</li><li>Nhức đầu, mệt mỏi</li><li>Đau cơ</li></ul><h3>Cách phòng ngừa</h3><ol><li>Tiêm vaccine cúm hàng năm</li><li>Rửa tay thường xuyên</li><li>Đeo khẩu trang nơi đông người</li><li>Tăng cường sức đề kháng</li><li>Tránh tiếp xúc người bệnh</li></ol>',
 'DISEASE_PREVENTION',
 'BS. Phạm Thị Lan',
 195,
 false,
 true,
 CURRENT_TIMESTAMP - INTERVAL '5 days',
 'cúm,mùa đông,phòng bệnh,vaccine cúm',
 'Bệnh viện Bạch Mai',
 CURRENT_TIMESTAMP - INTERVAL '6 days',
 CURRENT_TIMESTAMP - INTERVAL '5 days',
 false);

-- Children Health
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('dinh-duong-cho-tre-duoi-5-tuoi',
 'Dinh dưỡng cân đối cho trẻ dưới 5 tuổi',
 'Hướng dẫn xây dựng chế độ dinh dưỡng phù hợp giúp trẻ phát triển toàn diện',
 '<h2>Dinh dưỡng cho trẻ nhỏ</h2><p>Giai đoạn dưới 5 tuổi là thời kỳ vàng cho sự phát triển thể chất và trí tuệ của trẻ.</p><h3>Nguyên tắc dinh dưỡng</h3><ul><li>Đa dạng thực phẩm</li><li>Đủ 4 nhóm chất: Protein, Tinh bột, Chất béo, Vitamin</li><li>Ưu tiên thực phẩm tươi, sạch</li><li>Hạn chế đồ ngọt, đồ ăn nhanh</li></ul><h3>Thực đơn mẫu</h3><p>Sáng: Cháo thịt + rau xanh<br>Trưa: Cơm + cá/thịt + rau + trái cây<br>Chiều: Sữa + bánh quy<br>Tối: Cơm + canh + rau</p>',
 'CHILDREN_HEALTH',
 'BS. CKI Hoàng Văn Tuấn',
 420,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '4 days',
 'trẻ em,dinh dưỡng,sức khỏe,phát triển',
 'Viện Dinh dưỡng Quốc gia',
 CURRENT_TIMESTAMP - INTERVAL '5 days',
 CURRENT_TIMESTAMP - INTERVAL '4 days',
 false);

-- Nutrition
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('thuc-pham-tang-cuong-mien-dich',
 'Top 15 thực phẩm tăng cường hệ miễn dịch tự nhiên',
 'Danh sách các siêu thực phẩm giúp tăng cường sức đề kháng cho cơ thể',
 '<h2>Thực phẩm cho hệ miễn dịch</h2><p>Một số thực phẩm có khả năng tăng cường hệ miễn dịch tự nhiên của cơ thể.</p><h3>15 Siêu thực phẩm</h3><ol><li>Cam, quýt (Vitamin C)</li><li>Ớt chuông đỏ</li><li>Tỏi</li><li>Gừng</li><li>Rau bina</li><li>Sữa chua</li><li>Hạnh nhân</li><li>Nghệ</li><li>Trà xanh</li><li>Đu đủ</li><li>Kiwi</li><li>Cá hồi</li><li>Nấm</li><li>Bông cải xanh</li><li>Mật ong</li></ol>',
 'NUTRITION',
 'Ths. Đỗ Thị Mai',
 510,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '6 days',
 'dinh dưỡng,miễn dịch,thực phẩm,sức khỏe',
 'Viện Dinh dưỡng',
 CURRENT_TIMESTAMP - INTERVAL '7 days',
 CURRENT_TIMESTAMP - INTERVAL '6 days',
 false);

-- Women Health
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('cham-soc-suc-khoe-phu-nu-mang-thai',
 'Chăm sóc sức khỏe cho phụ nữ mang thai',
 'Hướng dẫn toàn diện về chăm sóc sức khỏe trong suốt thai kỳ',
 '<h2>Chăm sóc thai kỳ</h2><p>Thai kỳ là giai đoạn quan trọng cần được chăm sóc đặc biệt.</p><h3>Các xét nghiệm quan trọng</h3><ul><li>Siêu âm thai định kỳ</li><li>Xét nghiệm máu, nước tiểu</li><li>Sàng lọc dị tật thai nhi</li><li>Test tiểu đường thai kỳ</li></ul><h3>Chế độ dinh dưỡng</h3><ul><li>Bổ sung acid folic</li><li>Uống đủ nước</li><li>Ăn nhiều rau xanh</li><li>Bổ sung canxi</li></ul><h3>Lưu ý</h3><ul><li>Tập thể dục nhẹ nhàng</li><li>Tránh stress</li><li>Ngủ đủ giấc</li></ul>',
 'WOMEN_HEALTH',
 'BS. CKII Nguyễn Thị Hương',
 340,
 false,
 true,
 CURRENT_TIMESTAMP - INTERVAL '7 days',
 'phụ nữ,thai kỳ,mang thai,sức khỏe bà mẹ',
 'Bệnh viện Phụ sản Hà Nội',
 CURRENT_TIMESTAMP - INTERVAL '8 days',
 CURRENT_TIMESTAMP - INTERVAL '7 days',
 false);

-- Medical Research
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('vaccine-mrna-cong-nghe-tuong-lai',
 'Vaccine mRNA - Công nghệ y học của tương lai',
 'Tìm hiểu về công nghệ vaccine mRNA đột phá đã thay đổi ngành y học',
 '<h2>Công nghệ vaccine mRNA</h2><p>Vaccine mRNA là bước đột phá trong y học hiện đại, mở ra kỷ nguyên mới trong phòng chống dịch bệnh.</p><h3>Cơ chế hoạt động</h3><p>Vaccine mRNA chứa mRNA tổng hợp mã hóa cho protein gai của virus. Khi tiêm vào cơ thể, tế bào sẽ sản xuất protein này và kích thích phản ứng miễn dịch.</p><h3>Ưu điểm</h3><ul><li>Sản xuất nhanh chóng</li><li>An toàn, không chứa virus sống</li><li>Dễ điều chỉnh khi virus đột biến</li><li>Hiệu quả cao</li></ul><h3>Ứng dụng tương lai</h3><ul><li>Vaccine phòng ung thư</li><li>Điều trị bệnh hiếm</li><li>Vaccine cá nhân hóa</li></ul>',
 'MEDICAL_RESEARCH',
 'GS.TS Võ Văn Thành',
 180,
 false,
 true,
 CURRENT_TIMESTAMP - INTERVAL '8 days',
 'nghiên cứu,mRNA,vaccine,công nghệ',
 'Đại học Y Hà Nội',
 CURRENT_TIMESTAMP - INTERVAL '9 days',
 CURRENT_TIMESTAMP - INTERVAL '8 days',
 false);

-- Health Tips
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('5-bai-tap-yoga-giam-stress',
 '5 Bài tập yoga đơn giản giúp giảm stress hiệu quả',
 'Những bài tập yoga dễ thực hiện tại nhà giúp thư giãn tinh thần',
 '<h2>Yoga - Phương pháp giảm stress tự nhiên</h2><p>Yoga không chỉ giúp rèn luyện cơ thể mà còn mang lại sự thư thái cho tâm hồn.</p><h3>5 Tư thế cơ bản</h3><h4>1. Tư thế con mèo (Cat-Cow)</h4><p>Giúp giãn cơ lưng, giảm căng thẳng.</p><h4>2. Tư thế trẻ em (Child Pose)</h4><p>Thư giãn toàn thân, giảm mệt mỏi.</p><h4>3. Tư thế cây cầu (Bridge Pose)</h4><p>Tăng cường lưu thông máu não.</p><h4>4. Tư thế xoắn nằm (Supine Twist)</h4><p>Giải phóng căng thẳng cột sống.</p><h4>5. Tư thế xác chết (Savasana)</h4><p>Thư giãn sâu, thiền định.</p>',
 'HEALTH_TIPS',
 'HLV Yoga Trần Minh Châu',
 625,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '9 days',
 'yoga,stress,thư giãn,sức khỏe tinh thần',
 'Trung tâm Yoga & Wellness',
 CURRENT_TIMESTAMP - INTERVAL '10 days',
 CURRENT_TIMESTAMP - INTERVAL '9 days',
 false);

-- Seasonal Diseases
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('sot-xuat-huyet-mua-mua',
 'Phòng chúng sốt xuất huyết trong mùa mưa',
 'Những biện pháp quan trọng để phòng tránh dịch sốt xuất huyết',
 '<h2>Sốt xuất huyết - Căn bệnh nguy hiểm mùa mưa</h2><p>Sốt xuất huyết dengue là bệnh truyền nhiễm cấp tính do virus dengue gây ra, lây truyền qua muỗi Aedes.</p><h3>Triệu chứng</h3><ul><li>Sốt cao đột ngột 39-40°C</li><li>Đau đầu, đau mắt</li><li>Đau cơ, đau khớp</li><li>Xuất huyết dưới da</li><li>Chảy máu cam, nướu</li></ul><h3>Phòng ngừa</h3><ol><li>Diệt lăng quăng, bọ gậy</li><li>Sử dụng màn, mùng</li><li>Xịt thuốc diệt muỗi</li><li>Mặc quần áo dài tay</li><li>Vệ sinh môi trường</li></ol><h3>Khi nào cần đi khám?</h3><ul><li>Sốt trên 3 ngày</li><li>Xuất hiện vết xuất huyết</li><li>Chảy máu bất thường</li><li>Đau bụng, nôn nhiều</li></ul>',
 'SEASONAL_DISEASES',
 'BS. CKI Lê Thị Hồng',
 290,
 false,
 true,
 CURRENT_TIMESTAMP - INTERVAL '10 days',
 'sốt xuất huyết,mùa mưa,phòng bệnh,muỗi',
 'Viện Pasteur TP.HCM',
 CURRENT_TIMESTAMP - INTERVAL '11 days',
 CURRENT_TIMESTAMP - INTERVAL '10 days',
 false);

-- Elderly Care
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('cham-soc-nguoi-cao-tuoi',
 'Chăm sóc sức khỏe toàn diện cho người cao tuổi',
 'Hướng dẫn chăm sóc người cao tuổi về thể chất và tinh thần',
 '<h2>Chăm sóc người cao tuổi</h2><p>Người cao tuổi cần được chăm sóc đặc biệt về sức khỏe và tinh thần.</p><h3>Chế độ dinh dưỡng</h3><ul><li>Ăn nhiều bữa, mỗi bữa ít</li><li>Thực phẩm mềm, dễ tiêu</li><li>Bổ sung canxi, vitamin D</li><li>Hạn chế muối, đường</li></ul><h3>Hoạt động thể chất</h3><ul><li>Đi bộ nhẹ nhàng</li><li>Tập thể dục buổi sáng</li><li>Yoga, khí công</li></ul><h3>Sức khỏe tinh thần</h3><ul><li>Giao lưu với bạn bè</li><li>Tham gia hoạt động cộng đồng</li><li>Làm việc nhà nhẹ nhàng</li></ul>',
 'ELDERLY_CARE',
 'BS. Geriatrics Phạm Văn Bình',
 155,
 false,
 true,
 CURRENT_TIMESTAMP - INTERVAL '11 days',
 'người cao tuổi,chăm sóc,sức khỏe,dinh dưỡng',
 'Bệnh viện Lão khoa Trung ương',
 CURRENT_TIMESTAMP - INTERVAL '12 days',
 CURRENT_TIMESTAMP - INTERVAL '11 days',
 false);

-- COVID-19
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('bien-chung-sau-covid-19',
 'Hội chứng hậu COVID-19 và cách điều trị',
 'Tìm hiểu về các biến chứng kéo dài sau COVID-19 và phương pháp phục hồi',
 '<h2>Hội chứng hậu COVID-19 (Long COVID)</h2><p>Một số người sau khi khỏi COVID-19 vẫn có triệu chứng kéo dài nhiều tuần hoặc tháng.</p><h3>Triệu chứng thường gặp</h3><ul><li>Mệt mỏi kéo dài</li><li>Khó thở, đau ngực</li><li>Giảm khả năng tập trung</li><li>Mất ngủ</li><li>Đau đầu</li><li>Mất vị giác, khứu giác</li><li>Đau cơ, khớp</li></ul><h3>Cách phục hồi</h3><ol><li>Nghỉ ngơi hợp lý</li><li>Tập thở, tập phổi</li><li>Dinh dưỡng đầy đủ</li><li>Tập thể dục từ từ</li><li>Tái khám định kỳ</li></ol><h3>Khi nào cần gặp bác sĩ?</h3><p>Nếu triệu chứng kéo dài quá 4 tuần hoặc nặng lên, bạn nên đi khám để được theo dõi và điều trị kịp thời.</p>',
 'COVID_19',
 'PGS.TS Mai Văn Khiêm',
 445,
 true,
 true,
 CURRENT_TIMESTAMP - INTERVAL '1 day',
 'covid-19,long covid,biến chứng,phục hồi',
 'Bệnh viện Nhiệt đới TW',
 CURRENT_TIMESTAMP - INTERVAL '2 days',
 CURRENT_TIMESTAMP - INTERVAL '1 day',
 false);

-- Draft article (not published) for testing
INSERT INTO news (slug, title, short_description, content, category, author, view_count, is_featured, is_published, published_at, tags, source, created_at, updated_at, is_deleted)
VALUES
('bai-viet-nhap',
 'Bài viết nháp - Chưa xuất bản',
 'Đây là bài viết đang trong quá trình soạn thảo',
 '<p>Nội dung đang được cập nhật...</p>',
 'HEALTH_GENERAL',
 'Admin',
 0,
 false,
 false,
 NULL,
 'nháp',
 NULL,
 CURRENT_TIMESTAMP,
 CURRENT_TIMESTAMP,
 false);
