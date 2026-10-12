-- Dữ liệu mẫu tiếng Việt. Chỉ chứa INSERT; schema phải được tạo sẵn trước khi chạy.
-- Không migration bảng hoặc xóa/cập nhật dữ liệu trong file này.

-- 1. roles
INSERT INTO roles (name, description) VALUES
('GUEST', 'Khách vãng lai, chưa đăng ký'),
('REGISTERED_USER', 'Người dùng thông thường đã đăng ký'),
('MODERATOR', 'Người kiểm duyệt nội dung cộng đồng'),
('ADMINISTRATOR', 'Quản trị viên hệ thống'),
('BUSINESS_PARTNER', 'Đối tác doanh nghiệp (Ngân hàng, Sàn TMĐT)');

-- 2. reputation_ranks
INSERT INTO reputation_ranks (name, min_points, max_points, description) VALUES
('Tân Binh', 0, 99, 'Người dùng mới tham gia, cần thêm uy tín'),
('Hiệp Sĩ', 100, 499, 'Thành viên đóng góp tích cực'),
('Thủ Lĩnh', 500, 9999, 'Chuyên gia diệt lừa đảo đáng tin cậy');

-- 3. scam_categories
INSERT INTO scam_categories (code, name, description, version, is_active, created_at, updated_at) VALUES
('VIEC_LAM', 'Lừa đảo việc làm, CTV', 'Tuyển CTV làm nhiệm vụ ảo, chốt đơn hàng', 1, true, NOW(), NOW()),
('TRUNG_THUONG', 'Lừa đảo trúng thưởng', 'Yêu cầu nộp phí nhận quà', 1, true, NOW(), NOW()),
('GIA_DANH_CQCN', 'Giả danh cơ quan chức năng', 'Giả công an, tòa án dọa bắt giam', 1, true, NOW(), NOW());

-- 4. users
-- LƯU Ý: Mật khẩu của tất cả user dưới đây đều là: 123456 (đã được băm bằng BCrypt)
INSERT INTO users (full_name, phone_number, email, password_hash, role_id, reputation_rank_id, status, reputation_points, created_at, updated_at) VALUES
('Nguyễn Văn A', '0987654321', 'nguyenvana@gmail.com', '$2a$10$KjgQ5SG4mGFr37olOMAkxu4F4ekYORUUEleshwHskaOakgnZ.edu2', (SELECT id FROM roles WHERE name='REGISTERED_USER'), (SELECT id FROM reputation_ranks WHERE name='Hiệp Sĩ'), 'ACTIVE', 150, NOW(), NOW()),
('Admin ScamShield', '0988888888', 'admin@scamshield.vn', '$2a$10$KjgQ5SG4mGFr37olOMAkxu4F4ekYORUUEleshwHskaOakgnZ.edu2', (SELECT id FROM roles WHERE name='ADMINISTRATOR'), (SELECT id FROM reputation_ranks WHERE name='Thủ Lĩnh'), 'ACTIVE', 9999, NOW(), NOW()),
('Shopee Partner', '19001234', 'partner@shopee.vn', '$2a$10$KjgQ5SG4mGFr37olOMAkxu4F4ekYORUUEleshwHskaOakgnZ.edu2', (SELECT id FROM roles WHERE name='BUSINESS_PARTNER'), null, 'ACTIVE', 0, NOW(), NOW());

-- 5. refresh_tokens
INSERT INTO refresh_tokens (user_id, token_hash, created_at, expires_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'hash256_mock_token_123', NOW(), NOW() + INTERVAL '7 days');

-- 6. reputation_transactions
INSERT INTO reputation_transactions (user_id, points_delta, reason_code, created_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 10, 'REPORT_APPROVED', NOW());

-- 7. monthly_rewards
INSERT INTO monthly_rewards (user_id, reward_month, total_points, status) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), CURRENT_DATE, 150, 'PENDING');

-- 8. guest_sessions
INSERT INTO guest_sessions (session_token_hash, created_at) VALUES
('guest_token_abc123', NOW());

-- 9. quota_policies
INSERT INTO quota_policies (name, rank_id, max_checks_per_day, max_reports_per_day, created_at, updated_at) VALUES
('Tân Binh Quota', (SELECT id FROM reputation_ranks WHERE name='Tân Binh'), 10, 5, NOW(), NOW());

-- 10. quota_usage
INSERT INTO quota_usage (user_id, usage_date, check_count, report_count) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), CURRENT_DATE, 3, 1);

-- 11. rate_limit_policies
INSERT INTO rate_limit_policies (name, scope, max_requests, window_seconds, enabled, created_at, updated_at) VALUES
('Global API Limit', 'USER', 100, 60, true, NOW(), NOW());

-- 12. indicators
INSERT INTO indicators (type, normalized_value, display_value, created_at, updated_at) VALUES
('PHONE', '0987654321', '0987.654.321', NOW(), NOW()),
('URL', 'nhanqua-shopee.vip', 'http://nhanqua-shopee.vip', NOW(), NOW()),
('URL', 'shopee.vn', 'https://shopee.vn', NOW(), NOW());

-- 13. confirmed_indicators
INSERT INTO confirmed_indicators (indicator_id, category_id, status, confirmed_by, confirmed_at) VALUES
((SELECT id FROM indicators WHERE normalized_value='nhanqua-shopee.vip'), (SELECT id FROM scam_categories WHERE code='VIEC_LAM'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW());

-- 14. partner_profiles
INSERT INTO partner_profiles (user_id, legal_name, brand_name, partner_type, verification_status, created_at) VALUES
((SELECT id FROM users WHERE email='partner@shopee.vn'), 'Công ty TNHH Shopee', 'Shopee', 'BUSINESS', 'VERIFIED', NOW());

-- 15. whitelist_entries
INSERT INTO whitelist_entries (partner_id, indicator_id, verification_status, auto_lock_moderation, created_at) VALUES
((SELECT id FROM partner_profiles WHERE brand_name='Shopee'), (SELECT id FROM indicators WHERE normalized_value='shopee.vn'), 'VERIFIED', true, NOW());

-- 16. check_requests
INSERT INTO check_requests (user_id, input_type, status, created_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'URL', 'COMPLETED', NOW());

-- 17. extracted_iocs
INSERT INTO extracted_iocs (check_request_id, indicator_id, extraction_method, created_at) VALUES
((SELECT id FROM check_requests LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='nhanqua-shopee.vip'), 'REGEX', NOW());

-- 18. rule_definitions
INSERT INTO rule_definitions (code, name, rule_type, version, is_active, is_frozen, created_at, updated_at) VALUES
('R001', 'Phát hiện tên miền trúng thưởng ảo', 'URL_PATTERN', 1, true, false, NOW(), NOW());

-- 19. reports
INSERT INTO reports (reporter_user_id, indicator_id, status, category_id, report_count_signal, coordinated_report_suspected, moderation_locked, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), (SELECT id FROM indicators WHERE normalized_value='0987654321'), 'PENDING', (SELECT id FROM scam_categories WHERE code='TRUNG_THUONG'), 1, false, false, NOW(), NOW());

-- 20. report_evidence
INSERT INTO report_evidence (report_id, evidence_type, verification_status, created_at) VALUES
((SELECT id FROM reports LIMIT 1), 'SCREENSHOT', 'PENDING', NOW());

-- 21. moderation_actions
INSERT INTO moderation_actions (report_id, moderator_user_id, action, reason, created_at) VALUES
((SELECT id FROM reports LIMIT 1), (SELECT id FROM users WHERE email='admin@scamshield.vn'), 'APPROVE', 'Bằng chứng rõ ràng', NOW());

-- 22. disputes
INSERT INTO disputes (confirmed_indicator_id, submitted_by_user_id, reason, status, created_at) VALUES
((SELECT id FROM confirmed_indicators LIMIT 1), (SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'Trang này là web nội bộ của tôi, không lừa đảo', 'PENDING', NOW());

-- 23. dispute_evidence
INSERT INTO dispute_evidence (dispute_id, evidence_type, verification_status, created_at) VALUES
((SELECT id FROM disputes LIMIT 1), 'DOCUMENT', 'PENDING', NOW());

-- 24. abuse_flags
INSERT INTO abuse_flags (user_id, flag_type, severity, status, created_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'SPAM', 'LOW', 'OPEN', NOW());

-- 25. user_alert_subscriptions
INSERT INTO user_alert_subscriptions (user_id, category_id, subscribed_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), (SELECT id FROM scam_categories WHERE code='GIA_DANH_CQCN'), NOW());

-- 26. notifications
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'SYSTEM', 'Chào mừng', 'Chào mừng bạn đến với ScamShield. Hãy chung tay bảo vệ cộng đồng!', false, NOW());

-- 27. partner_official_alerts
INSERT INTO partner_official_alerts (partner_id, submission_type, title, description, status, created_at) VALUES
((SELECT id FROM partner_profiles WHERE brand_name='Shopee'), 'OFFICIAL_ALERT', 'Cảnh báo mạo danh Shopee tuyển CTV', 'Hiện nay có nhiều trang web giả mạo Shopee để lừa đảo tuyển CTV.', 'PENDING', NOW());

-- 28. warning_cards
INSERT INTO warning_cards (created_by_user_id, check_verdict_id, created_at) VALUES
((SELECT id FROM users WHERE email='admin@scamshield.vn'), 1, NOW()); 

-- 29. Education Hub: 4 ca giải phẫu và 3 thẻ gia đình theo giao diện mẫu.
-- Chạy API trước để Hibernate bổ sung các cột mới. Nếu đã có dữ liệu cơ bản, chỉ chạy mục 29.
-- Mục này chỉ INSERT, có kiểm tra tồn tại để chạy lại không thêm trùng.
-- image_url/pdf_url để NULL vì chưa có file ảnh/PDF thực tế, không tạo URL tải giả.
INSERT INTO scam_categories (code, name, description, version, is_active, created_at, updated_at)
SELECT v.code, v.name, v.description, 1, true,
       CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
FROM (VALUES
    ('GIA_DANH_NGAN_HANG', 'Mạo danh ngân hàng', 'Giả danh ngân hàng qua SMS Brandname và đường dẫn giả'),
    ('DANH_CAP_OTP', 'Đánh cắp mã OTP', 'Lừa cung cấp mã xác thực OTP và mã PIN'),
    ('VE_MAY_BAY_DU_LICH', 'Vé máy bay & Du lịch', 'Giả hoàn vé, hủy chuyến và đền bù qua liên kết độc hại')
) AS v(code, name, description)
WHERE NOT EXISTS (SELECT 1 FROM scam_categories c WHERE c.code = v.code);

-- jsonb_populate_record lấy đúng các cột của bảng hiện tại.
-- Khóa content rỗng chỉ để tương thích database cũ còn cột content NOT NULL.
-- Bảng mới không có cột content thì PostgreSQL bỏ qua khóa đó; entity/API không sử dụng content.
INSERT INTO education_articles
SELECT populated.*
FROM (VALUES
    ('SMS Brandname trạm phát BTS', 'sms-brandname-tram-phat-bts', 'SCENARIO',
     'Phát sóng giả mạo chèn thẳng tin nhắn lừa đảo vào luồng tin cậy ngân hàng.', 'GIA_DANH_NGAN_HANG', 'GIẢ MẠO BRANDNAME', 'Cực đại',
     '{"example":{"channelType":"SMS","senderName":"VCB Digibank","displayTime":"14:32","message":"Tai khoan bi khoa sau 30 phut. Xac minh ngay tai: portal-vcb-digibanks[.]vn de huy.","highlightedText":"portal-vcb-digibanks[.]vn"},"recognitionSigns":["Tên miền giả kèm áp lực thời gian."],"scammerGoal":"Chiếm đoạt mật khẩu và mã OTP.","recommendedActions":["Không bấm link. Mở thẳng App gốc."]}'::jsonb,
     NULL::text, NULL::integer, NULL::integer, 1),
    ('Video Zalo giả Cảnh sát điều tra', 'video-zalo-gia-canh-sat-dieu-tra', 'SCENARIO',
     'Dùng Deepfake khuôn mặt cán bộ trong phòng hỏi cung để hăm dọa chuyển tiền.', 'GIA_DANH_CQCN', 'DEEPFAKE - GIẢ DANH CƠ QUAN', 'Nguy cấp',
     '{"example":{"channelType":"VIDEO","senderName":"Zalo Video: CQ Điều tra","displayTime":"00:43","message":"Chị liên quan đường dây rửa tiền. Khóa cửa phòng, chuyển số dư vào tài khoản thanh tra ngay."},"recognitionSigns":["Mặt mờ giật, ép bảo mật tuyệt đối."],"scammerGoal":"Thao túng nỗi sợ để tự chuyển tiền.","recommendedActions":["Cúp máy. Công an không làm việc qua mạng."]}'::jsonb,
     NULL::text, NULL::integer, NULL::integer, 2),
    ('Tuyển CTV đơn hàng hoa hồng 10–20%', 'tuyen-ctv-don-hang-hoa-hong', 'SCENARIO',
     'Nạp tiền chốt đơn nhận lãi nhỏ ban đầu trước khi giữ khoản tiền lớn.', 'VIEC_LAM', 'CỘNG TÁC VIÊN ẢO', 'Phổ biến',
     '{"example":{"channelType":"CHAT","senderName":"Telegram CSKH","displayTime":"10:15","message":"Nhiệm vụ cuối: Nạp 15.000.000đ để nhận về 19.500.000đ. Ưu đãi giữ trong 10 phút!"},"recognitionSigns":["Hoa hồng bất thường, nhóm kín Telegram."],"scammerGoal":"Chiếm đoạt toàn bộ tiền nạp tích lũy.","recommendedActions":["Chặn liên lạc. Sàn TMĐT không tuyển nạp tiền."]}'::jsonb,
     NULL::text, NULL::integer, NULL::integer, 3),
    ('Cuộc gọi hoàn vé & hủy chuyến khẩn', 'cuoc-goi-hoan-ve-huy-chuyen-khan', 'SCENARIO',
     'Gọi thông báo hủy chuyến bay rồi gửi link nhận bồi thường chứa mã độc.', 'VE_MAY_BAY_DU_LICH', 'VÉ MÁY BAY & DU LỊCH', 'Tăng vọt',
     '{"example":{"channelType":"CALL","senderName":"Tổng đài Hãng không","displayTime":"18:40","message":"Chuyến bay bị hoãn, nhận đền bù 800.000đ qua link xác thực gửi kèm Zalo."},"recognitionSigns":["Yêu cầu cài tệp lạ hoặc truy cập link lạ."],"scammerGoal":"Đánh cắp OTP hoặc chiếm quyền điện thoại.","recommendedActions":["Chỉ tra cứu qua ứng dụng chính hãng."]}'::jsonb,
     NULL::text, NULL::integer, NULL::integer, 4),
    ('Quy tắc vàng 3 KHÔNG', 'quy-tac-vang-3-khong', 'POCKET_CARD',
     'Nguyên tắc cốt lõi trước mọi cuộc gọi và tin nhắn lạ.', NULL, 'THẺ #01', NULL,
     '{"tips":["1. KHÔNG hoảng sợ, hối thúc","2. KHÔNG bấm link lạ","3. KHÔNG chuyển tiền"]}'::jsonb,
     'Khổ thẻ A6', 1200, 800, 1),
    ('Bảo vệ người cao tuổi', 'bao-ve-nguoi-cao-tuoi', 'POCKET_CARD',
     'Nhận diện khi có số lạ xưng công an hù dọa.', 'GIA_DANH_CQCN', 'THẺ #02', NULL,
     '{"tips":["Công an chỉ gửi giấy mời trực tiếp.","Không có tài khoản tạm giữ cá nhân.","Cúp máy, gọi ngay đường dây 069.234.3640."]}'::jsonb,
     'Khổ in dán tường · Khổ dọc', NULL::integer, NULL::integer, 2),
    ('An toàn OTP & Mã PIN', 'an-toan-otp-ma-pin', 'POCKET_CARD',
     'Tấm khiên bảo vệ tài khoản ngân hàng và ví số.', 'DANH_CAP_OTP', 'THẺ #03', NULL,
     '{"tips":["Ngân hàng không bao giờ hỏi OTP.","Luôn đọc kỹ nội dung SMS giao dịch.","Không cấp quyền Trợ năng (Accessibility)."]}'::jsonb,
     'Hình nền điện thoại', 1080, 1920, 3)
) AS v(title, slug, content_type, summary, category_code, tag, badge_label, structured_content, format_label, image_width, image_height, display_order)
JOIN users u ON u.email = 'admin@scamshield.vn'
LEFT JOIN scam_categories c ON c.code = v.category_code
CROSS JOIN LATERAL jsonb_populate_record(NULL::education_articles, jsonb_build_object(
    'id', nextval(pg_get_serial_sequence('education_articles', 'id')),
    'title', v.title, 'slug', v.slug, 'content', '', 'content_type', v.content_type,
    'summary', v.summary, 'structured_content', v.structured_content, 'category_id', c.id,
    'tag', v.tag, 'badge_label', v.badge_label, 'image_url', NULL, 'pdf_url', NULL,
    'format_label', v.format_label, 'image_width', v.image_width, 'image_height', v.image_height,
    'display_order', v.display_order, 'status', 'PUBLISHED', 'created_by', u.id,
    'published_at', (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '1 minute',
    'created_at', (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '1 minute',
    'updated_at', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
)) AS populated
WHERE NOT EXISTS (SELECT 1 FROM education_articles a WHERE a.slug = v.slug);

-- GET /api/education-hub: 4 scenarios và 3 pocketCards khi chỉ có các bản ghi mẫu này.
-- GET /api/education-hub/contents?contentType=SCENARIO&categoryCode=GIA_DANH_NGAN_HANG
-- GET /api/education-hub/contents?contentType=POCKET_CARD&sort=DISPLAY_ORDER
-- GET /api/education-hub/contents/sms-brandname-tram-phat-bts
-- GET /api/education-hub/filters


-- 33. official_scam_warnings
INSERT INTO official_scam_warnings (title, content, status, created_at) VALUES
('Cảnh báo khẩn: Làn sóng lừa đảo mùa Tết', 'Nhiều đối tượng lợi dụng dịp lễ để giả danh tổ chức từ thiện...', 'PUBLISHED', NOW());

-- 34. audit_logs
INSERT INTO audit_logs (actor_user_id, action, entity_type, reason, created_at) VALUES
((SELECT id FROM users WHERE email='admin@scamshield.vn'), 'CREATE', 'USER', 'Tạo tài khoản quản trị hệ thống', NOW());

-- 35. Dashboard: dữ liệu cho GET /api/dashboard/summary và GET /api/dashboard/filters.
-- Nếu database đã có dữ liệu mẫu cơ bản ở trên, chỉ chạy từ mục 35 trở xuống.
-- Các INSERT trong mục này có kiểm tra tồn tại; chạy lại không thêm trùng và không đổi ngày đã lưu.
-- Ngày tương đối được tính theo giờ Việt Nam tại lúc chạy script, kể cả khi SQL client dùng UTC.
-- Dữ liệu dashboard từ 01/07/2026 (quý 3/2026) đến hiện tại: quý 3, quý 4, hôm nay, 7/30 ngày và kỳ trước.
-- Mã tỉnh: 01 Hà Nội, 79 TP.HCM, 48 Đà Nẵng, 31 Hải Phòng, 92 Cần Thơ, 24 Bắc Ninh.
-- Tên miền .example và STK MOCK-DASH-* chỉ dùng làm dữ liệu thử nghiệm.

INSERT INTO scam_categories (code, name, description, version, is_active, created_at, updated_at)
SELECT v.code, v.name, v.description, 1, true,
       CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
FROM (VALUES
    ('GIA_DANH_NGAN_HANG', 'Mạo danh ngân hàng', 'Giả nhân viên ngân hàng, dụ chuyển tiền vào tài khoản giả'),
    ('DANH_CAP_OTP', 'Đánh cắp mã OTP', 'Giả nhân viên nhà mạng hoặc hỗ trợ để lấy mã xác thực')
) AS v(code, name, description)
WHERE NOT EXISTS (SELECT 1 FROM scam_categories c WHERE c.code = v.code);

INSERT INTO indicators (type, normalized_value, display_value, created_at, updated_at)
SELECT v.type, v.value, v.display_value, TIMESTAMP '2026-07-01 00:00:00',
       CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
FROM (VALUES
    ('URL', 'dashboard-viec-lam.example', 'https://dashboard-viec-lam.example'),
    ('BANK_ACCOUNT', 'MOCK-DASH-STK-001', 'Tài khoản giả mạo ngân hàng 001'),
    ('PHONE', '0919000001', 'Số điện thoại giả danh cơ quan chức năng'),
    ('PHONE', '0919000002', 'Số điện thoại dụ cung cấp OTP'),
    ('URL', 'dashboard-trung-thuong.example', 'https://dashboard-trung-thuong.example'),
    ('URL', 'dashboard-pending.example', 'Đối tượng chưa được xác thực'),
    ('URL', 'dashboard-retracted.example', 'Đối tượng đã thu hồi khỏi blacklist'),
    ('BANK_ACCOUNT', 'MOCK-DASH-STK-OLD', 'Tài khoản đã xác thực từ kỳ trước'),
    ('URL', 'dashboard-q3-2026.example', 'Hồ sơ việc làm quý 3/2026'),
    ('URL', 'dashboard-q4-2026.example', 'Hồ sơ trúng thưởng quý 4/2026'),
    ('URL', 'dashboard-july-2026.example', 'Hồ sơ tháng 7/2026 để so sánh')
) AS v(type, value, display_value)
WHERE NOT EXISTS (SELECT 1 FROM indicators i WHERE i.normalized_value = v.value AND i.type = v.type);

-- Nhiều báo cáo dùng chung một indicator để kiểm tra blacklist không bị đếm trùng.
-- Báo cáo pending, đã thu hồi và thiếu tỉnh vẫn tính vào tổng lượt báo cáo.
INSERT INTO reports (reporter_user_id, indicator_id, status, category_id, region_code, description,
                     report_count_signal, coordinated_report_suspected, moderation_locked, created_at, updated_at)
SELECT u.id, i.id, v.status, c.id, v.region_code, 'DASHBOARD-MOCK:' || v.key,
       1, false, false,
       COALESCE(v.fixed_at, DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.day_offset * INTERVAL '1 day'),
       COALESCE(v.fixed_at, DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.day_offset * INTERVAL '1 day')
FROM (VALUES
    ('today-job-hn-1', 'dashboard-viec-lam.example', 'VIEC_LAM', '01', 'APPROVED', 0, NULL::timestamp),
    ('today-job-hn-2', 'dashboard-viec-lam.example', 'VIEC_LAM', '01', 'APPROVED', 0, NULL::timestamp),
    ('today-bank-hcm', 'MOCK-DASH-STK-001', 'GIA_DANH_NGAN_HANG', '79', 'APPROVED', 0, NULL::timestamp),
    ('today-otp-hn', '0919000002', 'DANH_CAP_OTP', '01', 'APPROVED', 0, NULL::timestamp),
    ('today-prize-hcm', 'dashboard-trung-thuong.example', 'TRUNG_THUONG', '79', 'APPROVED', 0, NULL::timestamp),
    ('today-pending-dn', 'dashboard-pending.example', 'VIEC_LAM', '48', 'PENDING', 0, NULL::timestamp),
    ('day-1-job-hcm', 'dashboard-viec-lam.example', 'VIEC_LAM', '79', 'APPROVED', -1, NULL::timestamp),
    ('day-2-authority-hn', '0919000001', 'GIA_DANH_CQCN', '01', 'APPROVED', -2, NULL::timestamp),
    ('day-4-bank-hp', 'MOCK-DASH-STK-001', 'GIA_DANH_NGAN_HANG', '31', 'APPROVED', -4, NULL::timestamp),
    ('day-5-prize-dn', 'dashboard-trung-thuong.example', 'TRUNG_THUONG', '48', 'APPROVED', -5, NULL::timestamp),
    ('day-6-otp-ct', '0919000002', 'DANH_CAP_OTP', '92', 'APPROVED', -6, NULL::timestamp),
    ('day-8-job-hn', 'dashboard-viec-lam.example', 'VIEC_LAM', '01', 'APPROVED', -8, NULL::timestamp),
    ('day-10-bank-hcm', 'MOCK-DASH-STK-001', 'GIA_DANH_NGAN_HANG', '79', 'APPROVED', -10, NULL::timestamp),
    ('day-13-prize-bn', 'dashboard-trung-thuong.example', 'TRUNG_THUONG', '24', 'APPROVED', -13, NULL::timestamp),
    ('day-9-retracted-hn', 'dashboard-retracted.example', 'TRUNG_THUONG', '01', 'REJECTED', -9, NULL::timestamp),
    ('day-12-authority-hcm', '0919000001', 'GIA_DANH_CQCN', '79', 'APPROVED', -12, NULL::timestamp),
    ('day-15-otp-hn', '0919000002', 'DANH_CAP_OTP', '01', 'APPROVED', -15, NULL::timestamp),
    ('day-20-job-hcm', 'dashboard-viec-lam.example', 'VIEC_LAM', '79', 'APPROVED', -20, NULL::timestamp),
    ('day-25-old-bank-hcm', 'MOCK-DASH-STK-OLD', 'GIA_DANH_NGAN_HANG', '79', 'APPROVED', -25, NULL::timestamp),
    ('day-29-job-hn', 'dashboard-viec-lam.example', 'VIEC_LAM', '01', 'APPROVED', -29, NULL::timestamp),
    ('day-3-unlocated', 'dashboard-pending.example', 'VIEC_LAM', NULL, 'PENDING', -3, NULL::timestamp),
    ('previous-30-job', 'dashboard-viec-lam.example', 'VIEC_LAM', '01', 'APPROVED', -30, NULL::timestamp),
    ('previous-35-bank', 'MOCK-DASH-STK-OLD', 'GIA_DANH_NGAN_HANG', '79', 'APPROVED', -35, NULL::timestamp),
    ('previous-45-bank', 'MOCK-DASH-STK-OLD', 'GIA_DANH_NGAN_HANG', '79', 'APPROVED', -45, NULL::timestamp),
    ('previous-59-pending', 'dashboard-pending.example', 'VIEC_LAM', '48', 'PENDING', -59, NULL::timestamp),
    ('q3-2026-jul', 'dashboard-q3-2026.example', 'VIEC_LAM', '01', 'APPROVED', NULL, TIMESTAMP '2026-07-02 10:00:00'),
    ('q3-2026-aug', 'dashboard-q3-2026.example', 'VIEC_LAM', '79', 'APPROVED', NULL, TIMESTAMP '2026-08-12 15:00:00'),
    ('q3-2026-sep', 'dashboard-q3-2026.example', 'VIEC_LAM', '31', 'APPROVED', NULL, TIMESTAMP '2026-09-30 23:59:59'),
    ('q4-2026-oct-01', 'dashboard-q4-2026.example', 'TRUNG_THUONG', '48', 'APPROVED', NULL, TIMESTAMP '2026-10-01 09:00:00'),
    ('q4-2026-oct-05', 'dashboard-q4-2026.example', 'TRUNG_THUONG', '92', 'APPROVED', NULL, TIMESTAMP '2026-10-05 14:00:00'),
    ('q4-2026-oct-10', 'dashboard-q4-2026.example', 'TRUNG_THUONG', '24', 'APPROVED', NULL, TIMESTAMP '2026-10-10 23:59:59'),
    ('july-2026-15', 'dashboard-july-2026.example', 'VIEC_LAM', '01', 'APPROVED', NULL, TIMESTAMP '2026-07-15 10:00:00')
) AS v(key, value, category_code, region_code, status, day_offset, fixed_at)
JOIN users u ON u.email = 'nguyenvana@gmail.com'
JOIN indicators i ON i.normalized_value = v.value
JOIN scam_categories c ON c.code = v.category_code
WHERE NOT EXISTS (SELECT 1 FROM reports r WHERE r.description = 'DASHBOARD-MOCK:' || v.key);

-- Đủ 5 danh mục ACTIVE trong 30 ngày qua. PHONE thuộc danh mục xác thực nhưng không cộng vào STK & URL.
-- Blacklist cũ vẫn giúp xác định nguy cơ cao, nhưng không tính là vừa thêm vào blacklist trong 30 ngày.
-- Hồ sơ RETRACTED có retracted_at; API phải loại khỏi số đã xác thực và số danh mục hiện hành.
INSERT INTO confirmed_indicators (indicator_id, category_id, status, confirmed_by, source_report_id,
                                  confirmed_at, retracted_at, retraction_reason, public_reason)
SELECT i.id, c.id, v.status, u.id, r.id,
       COALESCE(v.fixed_at, DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.day_offset * INTERVAL '1 day'),
       CASE WHEN v.status = 'RETRACTED' THEN DATE_TRUNC('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '2 days' ELSE NULL END,
       CASE WHEN v.status = 'RETRACTED' THEN 'Dữ liệu mẫu: bằng chứng không hợp lệ, đã thu hồi xác thực' ELSE NULL END,
       'Dữ liệu mẫu phục vụ kiểm thử dashboard'
FROM (VALUES
    ('dashboard-viec-lam.example', 'VIEC_LAM', 'ACTIVE', -1, NULL::timestamp, 'day-29-job-hn'),
    ('MOCK-DASH-STK-001', 'GIA_DANH_NGAN_HANG', 'ACTIVE', -4, NULL::timestamp, 'day-10-bank-hcm'),
    ('0919000001', 'GIA_DANH_CQCN', 'ACTIVE', -2, NULL::timestamp, 'day-2-authority-hn'),
    ('0919000002', 'DANH_CAP_OTP', 'ACTIVE', 0, NULL::timestamp, 'today-otp-hn'),
    ('dashboard-trung-thuong.example', 'TRUNG_THUONG', 'ACTIVE', -5, NULL::timestamp, 'day-13-prize-bn'),
    ('dashboard-retracted.example', 'TRUNG_THUONG', 'RETRACTED', -9, NULL::timestamp, 'day-9-retracted-hn'),
    ('MOCK-DASH-STK-OLD', 'GIA_DANH_NGAN_HANG', 'ACTIVE', -45, NULL::timestamp, 'previous-45-bank'),
    ('dashboard-q3-2026.example', 'VIEC_LAM', 'ACTIVE', NULL, TIMESTAMP '2026-09-30 23:59:59', 'q3-2026-jul'),
    ('dashboard-q4-2026.example', 'TRUNG_THUONG', 'ACTIVE', NULL, TIMESTAMP '2026-10-06 08:00:00', 'q4-2026-oct-01'),
    ('dashboard-july-2026.example', 'VIEC_LAM', 'ACTIVE', NULL, TIMESTAMP '2026-07-16 08:00:00', 'july-2026-15')
) AS v(value, category_code, status, day_offset, fixed_at, report_key)
JOIN indicators i ON i.normalized_value = v.value
JOIN scam_categories c ON c.code = v.category_code
JOIN users u ON u.email = 'admin@scamshield.vn'
JOIN reports r ON r.description = 'DASHBOARD-MOCK:' || v.report_key
WHERE NOT EXISTS (SELECT 1 FROM confirmed_indicators ci WHERE ci.indicator_id = i.id);
