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
('GIA_DANH_CQCN', 'Giả danh cơ quan chức năng', 'Giả công an, tòa án dọa bắt giam', 1, true, NOW(), NOW()),
('VIEN_THONG', 'Giả Mạo Viễn Thông', 'Giả mạo nhà mạng khóa chiều thuê bao', 1, true, NOW(), NOW()),
('MALWARE', 'Giả Mạo VNeID / Malware', 'Mã độc đánh cắp tài khoản và OTP', 1, true, NOW(), NOW()),
('CSGT', 'Giả Mạo Cảnh Sát Giao Thông', 'Thông báo phạt nguội phương tiện giả mạo', 1, true, NOW(), NOW()),
('FOREX', 'Sàn Forex / Tiền Ảo', 'Cam kết lợi nhuận 3.5%/ngày bảo hiểm vốn ảo', 1, true, NOW(), NOW());

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
('URL', 'shopee.vn', 'https://shopee.vn', NOW(), NOW()),
('PHONE', '0912443882', '+84 912.443.882', NOW(), NOW()),
('URL', 'dichvucong-vneid-capnhat.gov-vn.info/apk', 'https://dichvucong-vneid-capnhat.gov-vn.info/ap...', NOW(), NOW()),
('SMS_BANK', 'vietcombank', 'SMS Brandname: Vietcombank', NOW(), NOW()),
('TELEGRAM', '@tuyendungshopeemall_hr', 'Zalo/Telegram: @TuyenDungShopeeMall_HR', NOW(), NOW()),
('BANK_ACCOUNT', '104889201992', 'STK: 104889201992 - VPBank (VU HOANG ANH)', NOW(), NOW()),
('TRAFFIC_FINE', 'tra-cuu-phatnguoi-c08.top/bienban', 'http://tra-cuu-phatnguoi-c08.top/bienban', NOW(), NOW()),
('CRYPTO', 'binance-vip-asia-trade.cc', 'https://binance-vip-asia-trade.cc', NOW(), NOW());

-- 13. confirmed_indicators
INSERT INTO confirmed_indicators (indicator_id, category_id, status, confirmed_by, confirmed_at) VALUES
((SELECT id FROM indicators WHERE normalized_value='nhanqua-shopee.vip'), (SELECT id FROM scam_categories WHERE code='VIEC_LAM'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW()),
((SELECT id FROM indicators WHERE normalized_value='0912443882'), (SELECT id FROM scam_categories WHERE code='VIEN_THONG'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW() + INTERVAL '1 hour'),
((SELECT id FROM indicators WHERE normalized_value='dichvucong-vneid-capnhat.gov-vn.info/apk'), (SELECT id FROM scam_categories WHERE code='MALWARE'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW()),
((SELECT id FROM indicators WHERE normalized_value='tra-cuu-phatnguoi-c08.top/bienban'), (SELECT id FROM scam_categories WHERE code='CSGT'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW()),
((SELECT id FROM indicators WHERE normalized_value='binance-vip-asia-trade.cc'), (SELECT id FROM scam_categories WHERE code='FOREX'), 'ACTIVE', (SELECT id FROM users WHERE email='admin@scamshield.vn'), NOW());

-- 14. partner_profiles
INSERT INTO partner_profiles (user_id, legal_name, brand_name, partner_type, verification_status, created_at) VALUES
((SELECT id FROM users WHERE email='partner@shopee.vn'), 'Công ty TNHH Shopee', 'Shopee', 'BUSINESS', 'VERIFIED', NOW());

-- 15. whitelist_entries
INSERT INTO whitelist_entries (partner_id, indicator_id, verification_status, auto_lock_moderation, created_at) VALUES
((SELECT id FROM partner_profiles WHERE brand_name='Shopee'), (SELECT id FROM indicators WHERE normalized_value='shopee.vn'), 'VERIFIED', true, NOW()),
((SELECT id FROM partner_profiles WHERE brand_name='Shopee'), (SELECT id FROM indicators WHERE normalized_value='vietcombank'), 'VERIFIED', true, NOW());

-- 16. check_requests
INSERT INTO check_requests (user_id, input_type, raw_input, normalized_input, masked_input, status, created_at) VALUES
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'PHONE', 'Thông báo thuê bao sẽ bị khóa chiều sau 2 giờ do vi phạm quy định viễn thông...', '0912443882', '+84 912.443.882', 'COMPLETED', NOW() - INTERVAL '1 hour'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'URL', 'Link yêu cầu tải file APK "Dịch vụ công Bộ Công An v2.8" giả mạo đánh cắp mã OTP.', 'dichvucong-vneid-capnhat.gov-vn.info/apk', 'https://dichvucong-vneid-capnhat.gov-vn.info/ap...', 'COMPLETED', NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'SMS_BANK', '"VCB Digibank: QK dang thuc hien giao dich 2,500,000 VND tai he thong POS..."', 'vietcombank', 'SMS Brandname: Vietcombank', 'COMPLETED', NOW() - INTERVAL '6 hours'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'TELEGRAM', '"Việc nhẹ làm tại nhà 400k-800k/ngày, duyệt đơn hàng nhận hoa hồng ngay lập tức..."', '@tuyendungshopeemall_hr', 'Zalo/Telegram: @TuyenDungShopeeMall_HR', 'COMPLETED', NOW() - INTERVAL '12 hours'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'BANK_ACCOUNT', 'Tài khoản cá nhân giao dịch mua bán đồ gia dụng online trên hội nhóm mạng xã hội.', '104889201992', 'STK: 104889201992 - VPBank (VU HOANG ANH)', 'COMPLETED', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'TRAFFIC_FINE', '"Cục Cảnh sát giao thông thông báo phương tiện 29A-883.xx có biên bản phạt nguội..."', 'tra-cuu-phatnguoi-c08.top/bienban', 'http://tra-cuu-phatnguoi-c08.top/bienban', 'COMPLETED', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email='nguyenvana@gmail.com'), 'CRYPTO', '"Nạp USDT cam kết lợi nhuận 3.5%/ngày, bảo hiểm vốn 100% bởi quỹ ủy thác..."', 'binance-vip-asia-trade.cc', 'https://binance-vip-asia-trade.cc', 'COMPLETED', NOW() - INTERVAL '3 days');

-- 17. extracted_iocs
INSERT INTO extracted_iocs (check_request_id, indicator_id, extraction_method, created_at) VALUES
((SELECT id FROM check_requests WHERE normalized_input='0912443882' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='0912443882'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='dichvucong-vneid-capnhat.gov-vn.info/apk' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='dichvucong-vneid-capnhat.gov-vn.info/apk'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='vietcombank' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='vietcombank'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='@tuyendungshopeemall_hr' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='@tuyendungshopeemall_hr'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='104889201992' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='104889201992'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='tra-cuu-phatnguoi-c08.top/bienban' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='tra-cuu-phatnguoi-c08.top/bienban'), 'REGEX', NOW()),
((SELECT id FROM check_requests WHERE normalized_input='binance-vip-asia-trade.cc' LIMIT 1), (SELECT id FROM indicators WHERE normalized_value='binance-vip-asia-trade.cc'), 'REGEX', NOW());

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

-- 33. official_scam_warnings
INSERT INTO official_scam_warnings (title, content, status, created_at) VALUES
('Cảnh báo khẩn: Làn sóng lừa đảo mùa Tết', 'Nhiều đối tượng lợi dụng dịp lễ để giả danh tổ chức từ thiện...', 'PUBLISHED', NOW());

-- 34. audit_logs
INSERT INTO audit_logs (actor_user_id, action, entity_type, reason, created_at) VALUES
((SELECT id FROM users WHERE email='admin@scamshield.vn'), 'CREATE', 'USER', 'Tạo tài khoản quản trị hệ thống', NOW());

-- 35. Dashboard: dữ liệu cho GET /api/dashboard/summary và GET /api/dashboard/filters.

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

-- 36. Khiếu nại: dữ liệu cho GET /api/disputes/me và GET /api/disputes/me/summary.

INSERT INTO scam_categories (code, name, description, version, is_active, created_at, updated_at)
SELECT 'GIA_DANH_NGAN_HANG', 'Mạo danh ngân hàng', 'Giả danh ngân hàng và lừa đảo tài khoản', 1, true,
       CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
WHERE NOT EXISTS (SELECT 1 FROM scam_categories WHERE code = 'GIA_DANH_NGAN_HANG');

INSERT INTO indicators (type, normalized_value, display_value, created_at, updated_at)
SELECT v.type, v.value, v.display_value,
       (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '10 days',
       CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
FROM (VALUES
    ('URL', 'dispute-pending.example', 'dispute-pending.example'),
    ('PHONE', '0919000091', '091.900.0091 (Hotline doanh nghiệp mẫu)'),
    ('BANK_ACCOUNT', 'MOCK-DSP-BANK-001', 'STK Techcombank 1029999.xxxx (mẫu)'),
    ('URL', 'dispute-techcorp.example', 'dispute-techcorp.example'),
    ('PHONE', '0919000092', '091.900.0092 (Hotline đã được giải tỏa)'),
    ('URL', 'dispute-rejected.example', 'dispute-rejected.example'),
    ('URL', 'dispute-partner.example', 'dispute-partner.example'),
    ('BANK_ACCOUNT', 'MOCK-DSP-BANK-002', '1029999.xxxx'),
    ('PHONE', '0919000094', '091.900.0094'),
    ('URL', 'dispute-review-shop.example', 'dispute-review-shop.example'),
    ('URL', 'dispute-supplement-overdue.example', 'dispute-supplement-overdue.example'),
    ('URL', 'dispute-approved-active.example', 'dispute-approved-active.example'),
    ('BANK_ACCOUNT', 'MOCK-DSP-BANK-003', '1902999.xxxx')
) AS v(type, value, display_value)
WHERE NOT EXISTS (SELECT 1 FROM indicators i WHERE i.type = v.type AND i.normalized_value = v.value);

INSERT INTO confirmed_indicators (indicator_id, category_id, status, confirmed_by, confirmed_at,
                                  retracted_at, retraction_reason, public_reason)
SELECT i.id, c.id, v.status, u.id,
       (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '10 days',
       CASE WHEN v.status = 'RETRACTED' THEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.retracted_offset ELSE NULL END,
       CASE WHEN v.status = 'RETRACTED' THEN 'Dữ liệu mẫu: khiếu nại được chấp nhận, thu hồi xác thực sai' ELSE NULL END,
       'Dữ liệu mẫu phục vụ kiểm thử danh sách khiếu nại'
FROM (VALUES
    ('dispute-pending.example', 'VIEC_LAM', 'ACTIVE', NULL::interval),
    ('0919000091', 'GIA_DANH_CQCN', 'ACTIVE', NULL::interval),
    ('MOCK-DSP-BANK-001', 'GIA_DANH_NGAN_HANG', 'ACTIVE', NULL::interval),
    ('dispute-techcorp.example', 'GIA_DANH_CQCN', 'RETRACTED', -INTERVAL '84 hours'),
    ('0919000092', 'GIA_DANH_CQCN', 'RETRACTED', -INTERVAL '54 hours'),
    ('dispute-rejected.example', 'VIEC_LAM', 'ACTIVE', NULL::interval),
    ('dispute-partner.example', 'VIEC_LAM', 'ACTIVE', NULL::interval),
    ('MOCK-DSP-BANK-002', 'GIA_DANH_NGAN_HANG', 'ACTIVE', NULL::interval),
    ('0919000094', 'GIA_DANH_CQCN', 'ACTIVE', NULL::interval),
    ('dispute-review-shop.example', 'VIEC_LAM', 'ACTIVE', NULL::interval),
    ('dispute-supplement-overdue.example', 'VIEC_LAM', 'ACTIVE', NULL::interval),
    ('dispute-approved-active.example', 'GIA_DANH_CQCN', 'RETRACTED', -INTERVAL '3 hours'),
    ('MOCK-DSP-BANK-003', 'GIA_DANH_NGAN_HANG', 'ACTIVE', NULL::interval)
) AS v(value, category_code, status, retracted_offset)
JOIN indicators i ON i.normalized_value = v.value
JOIN scam_categories c ON c.code = v.category_code
JOIN users u ON u.email = 'admin@scamshield.vn'
WHERE NOT EXISTS (SELECT 1 FROM confirmed_indicators ci WHERE ci.indicator_id = i.id);

INSERT INTO disputes (confirmed_indicator_id, submitted_by_user_id, submitter_name, submitter_contact,
                      reason, status, priority, progress_message, estimated_resolution_at,
                      supplement_reason, supplement_deadline, assigned_to, resolved_by,
                      resolution_reason, resolution_document_url, created_at, updated_at, resolved_at)
SELECT ci.id, u.id, u.full_name, u.email, 'DISPUTE-MOCK:' || v.key || ' — ' || v.reason, v.status, v.priority,
       v.progress_message,
       CASE WHEN v.estimated_offset IS NOT NULL THEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.estimated_offset ELSE NULL END,
       v.supplement_reason,
       CASE WHEN v.supplement_offset IS NOT NULL THEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.supplement_offset ELSE NULL END,
       CASE WHEN v.status <> 'PENDING' THEN reviewer.id ELSE NULL END,
       CASE WHEN v.status IN ('APPROVED', 'REJECTED') THEN reviewer.id ELSE NULL END,
       v.resolution_reason, v.resolution_document_url,
       (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.created_offset,
       CASE WHEN v.resolved_offset IS NOT NULL THEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.resolved_offset
            ELSE CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' END,
       CASE WHEN v.resolved_offset IS NOT NULL THEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') + v.resolved_offset ELSE NULL END
FROM (VALUES
    ('pending-domain', 'dispute-pending.example', 'nguyenvana@gmail.com', 'Tên miền chính chủ bị gắn nhãn nhầm.', 'PENDING', 'NORMAL',
     'Đã tiếp nhận hồ sơ, đang chờ phân công người thẩm định.', INTERVAL '47 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '1 hour', NULL::interval),
    ('review-hotline', '0919000091', 'nguyenvana@gmail.com', 'Hotline doanh nghiệp bị nhầm với số mạo danh.', 'IN_REVIEW', 'HIGH',
     'Đang đối chiếu giấy phép kinh doanh và chứng từ sở hữu đầu số.', INTERVAL '22 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '6 hours', NULL::interval),
    ('supplement-bank', 'MOCK-DSP-BANK-001', 'nguyenvana@gmail.com', 'Tài khoản ngân hàng của tôi bị báo cáo sai.', 'NEEDS_MORE_INFO', 'NORMAL',
     'Hồ sơ cần bổ sung bằng chứng trước khi tiếp tục thẩm định.', NULL::interval,
     'Vui lòng bổ sung sao kê giao dịch và giấy xác nhận chủ tài khoản.', INTERVAL '2 days',
     NULL::text, NULL::text, -INTERVAL '1 day', NULL::interval),
    ('restored-domain', 'dispute-techcorp.example', 'nguyenvana@gmail.com', 'Tên miền doanh nghiệp bị giả mạo dẫn đến gắn nhãn sai.', 'APPROVED', 'HIGH',
     'Đã hoàn tất thẩm định và thu hồi xác thực blacklist sai.', NULL::interval, NULL::text, NULL::interval,
     'Đã xác minh quyền sở hữu tên miền và chấp nhận khiếu nại. Xác thực blacklist trong ScamShield đã được thu hồi.',
     'https://files.example/disputes/restored-domain/quyet-dinh-giai-toa.pdf', -INTERVAL '96 hours', -INTERVAL '84 hours'),
    ('restored-phone', '0919000092', 'nguyenvana@gmail.com', 'Số điện thoại chính chủ bị gắn nhãn sai.', 'APPROVED', 'NORMAL',
     'Đã hoàn tất thẩm định và giải tỏa chỉ số trong ScamShield.', NULL::interval, NULL::text, NULL::interval,
     'Chứng từ thuê đầu số hợp lệ; chấp nhận khiếu nại và thu hồi xác thực blacklist.',
     'https://files.example/disputes/restored-phone/bien-ban-giai-toa.pdf', -INTERVAL '72 hours', -INTERVAL '54 hours'),
    ('rejected-domain', 'dispute-rejected.example', 'nguyenvana@gmail.com', 'Đề nghị xem xét lại kết quả xác thực tên miền.', 'REJECTED', 'NORMAL',
     'Đã hoàn tất thẩm định, giữ nguyên xác thực blacklist.', NULL::interval, NULL::text, NULL::interval,
     'Bằng chứng chưa chứng minh quyền sở hữu hợp lệ; khiếu nại bị từ chối, xác thực blacklist vẫn còn hiệu lực.',
     NULL::text, -INTERVAL '48 hours', -INTERVAL '1368 minutes'),
    ('partner-private', 'dispute-partner.example', 'partner@shopee.vn', 'Hồ sơ riêng của tài khoản đối tác để kiểm tra phân quyền.', 'PENDING', 'NORMAL',
     'Đã tiếp nhận hồ sơ của đối tác.', INTERVAL '47 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '2 hours', NULL::interval),
    ('pending-bank', 'MOCK-DSP-BANK-002', 'nguyenvana@gmail.com', 'Đề nghị xác minh lại tài khoản ngân hàng bị báo cáo nhầm.', 'PENDING', 'NORMAL',
     'Đã tiếp nhận hồ sơ tài khoản ngân hàng, chờ phân công thẩm định.', INTERVAL '46 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '2 hours', NULL::interval),
    ('pending-phone-empty', '0919000094', 'nguyenvana@gmail.com', 'Số điện thoại cá nhân bị nhầm là số mạo danh.', 'PENDING', 'NORMAL',
     'Đã tiếp nhận hồ sơ; chưa có tệp đính kèm.', INTERVAL '47 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '30 minutes', NULL::interval),
    ('review-shop', 'dispute-review-shop.example', 'nguyenvana@gmail.com', 'Website cửa hàng chính chủ bị gắn nhãn lừa đảo.', 'IN_REVIEW', 'HIGH',
     'Đang kiểm tra quyền quản trị tên miền và đối chiếu chứng từ giao dịch của cửa hàng.', INTERVAL '4 hours', NULL::text, NULL::interval,
     NULL::text, NULL::text, -INTERVAL '12 hours', NULL::interval),
    ('supplement-overdue', 'dispute-supplement-overdue.example', 'nguyenvana@gmail.com', 'Yêu cầu xác minh lại tên miền bị gắn nhãn sai.', 'NEEDS_MORE_INFO', 'NORMAL',
     'Chưa nhận được tài liệu bổ sung; hạn bổ sung đã hết.', NULL::interval,
     'Bổ sung chứng nhận sở hữu tên miền và hóa đơn của nhà đăng ký.', -INTERVAL '1 day',
     NULL::text, NULL::text, -INTERVAL '3 days', NULL::interval),
    ('approved-awaiting-retraction', 'dispute-approved-active.example', 'nguyenvana@gmail.com', 'Đã cung cấp bằng chứng quyền sở hữu tên miền hợp lệ.', 'APPROVED', 'HIGH',
     'Đã chấp nhận khiếu nại và thu hồi xác thực blacklist.', NULL::interval, NULL::text, NULL::interval,
     'Chấp nhận khiếu nại và thu hồi xác thực blacklist sai sau khi xác minh quyền sở hữu tên miền.',
     'https://files.example/disputes/approved-awaiting-retraction/quyet-dinh.pdf', -INTERVAL '9 hours', -INTERVAL '3 hours'),
    ('rejected-bank', 'MOCK-DSP-BANK-003', 'nguyenvana@gmail.com', 'Đề nghị giải tỏa tài khoản ngân hàng đang bị cảnh báo.', 'REJECTED', 'NORMAL',
     'Đã hoàn tất kiểm tra hồ sơ; giữ nguyên xác thực blacklist.', NULL::interval, NULL::text, NULL::interval,
     'Tài liệu không khớp thông tin chủ tài khoản; từ chối khiếu nại.',
     NULL::text, -INTERVAL '36 hours', -INTERVAL '26 hours')
) AS v(key, value, email, reason, status, priority, progress_message, estimated_offset,
       supplement_reason, supplement_offset, resolution_reason, resolution_document_url, created_offset, resolved_offset)
JOIN indicators i ON i.normalized_value = v.value
JOIN confirmed_indicators ci ON ci.indicator_id = i.id
JOIN users u ON u.email = v.email
JOIN users reviewer ON reviewer.email = 'admin@scamshield.vn'
WHERE NOT EXISTS (SELECT 1 FROM disputes d WHERE d.reason LIKE 'DISPUTE-MOCK:' || v.key || ' — %');

INSERT INTO dispute_evidence (dispute_id, evidence_type, file_name, file_url, description, verification_status, created_at)
SELECT d.id, 'DOCUMENT', v.file_name, v.file_url, v.description, v.verification_status, d.created_at + INTERVAL '5 minutes'
FROM (VALUES
    ('pending-domain', 'xac-nhan-ten-mien.pdf', 'https://files.example/disputes/pending-domain/xac-nhan-ten-mien.pdf', 'Giấy xác nhận đăng ký tên miền.', 'PENDING'),
    ('review-hotline', 'giay-phep-kinh-doanh.pdf', 'https://files.example/disputes/review-hotline/giay-phep-kinh-doanh.pdf', 'Giấy phép đăng ký kinh doanh của doanh nghiệp mẫu.', 'PENDING'),
    ('review-hotline', 'hop-dong-thue-dau-so.pdf', 'https://files.example/disputes/review-hotline/hop-dong-thue-dau-so.pdf', 'Hợp đồng thuê đầu số hotline.', 'PENDING'),
    ('supplement-bank', 'xac-nhan-chu-tai-khoan.pdf', 'https://files.example/disputes/supplement-bank/xac-nhan-chu-tai-khoan.pdf', 'Bản xác nhận tài khoản cần đối chiếu thêm sao kê.', 'PENDING'),
    ('restored-domain', 'chung-nhan-so-huu-domain.pdf', 'https://files.example/disputes/restored-domain/chung-nhan-so-huu-domain.pdf', 'Chứng nhận quyền sở hữu tên miền đã được đối chiếu.', 'VERIFIED'),
    ('restored-phone', 'hop-dong-vien-thong.pdf', 'https://files.example/disputes/restored-phone/hop-dong-vien-thong.pdf', 'Hợp đồng thuê đầu số chính chủ đã được đối chiếu.', 'VERIFIED'),
    ('rejected-domain', 'minh-chung-khieu-nai.pdf', 'https://files.example/disputes/rejected-domain/minh-chung-khieu-nai.pdf', 'Tài liệu không đủ cơ sở xác minh quyền sở hữu.', 'REJECTED'),
    ('partner-private', 'tai-lieu-doi-tac.pdf', 'https://files.example/disputes/partner-private/tai-lieu-doi-tac.pdf', 'Tài liệu riêng của tài khoản đối tác.', 'PENDING'),
    ('pending-bank', 'xac-nhan-tai-khoan.pdf', 'https://files.example/disputes/pending-bank/xac-nhan-tai-khoan.pdf', 'Thông tin tài khoản chờ đối chiếu.', 'PENDING'),
    ('review-shop', 'chung-nhan-ten-mien.pdf', 'https://files.example/disputes/review-shop/chung-nhan-ten-mien.pdf', 'Chứng nhận tên miền cửa hàng.', 'VERIFIED'),
    ('review-shop', 'hoa-don-giao-dich.pdf', 'https://files.example/disputes/review-shop/hoa-don-giao-dich.pdf', 'Hóa đơn đang được đối chiếu.', 'PENDING'),
    ('supplement-overdue', 'anh-website.png', 'https://files.example/disputes/supplement-overdue/anh-website.png', 'Ảnh website chưa đủ xác nhận quyền sở hữu.', 'PENDING'),
    ('approved-awaiting-retraction', 'chung-nhan-so-huu.pdf', 'https://files.example/disputes/approved-awaiting-retraction/chung-nhan-so-huu.pdf', 'Chứng nhận quyền sở hữu đã được xác minh.', 'VERIFIED'),
    ('rejected-bank', 'giay-xac-nhan.pdf', 'https://files.example/disputes/rejected-bank/giay-xac-nhan.pdf', 'Tài liệu không khớp chủ tài khoản.', 'REJECTED')
) AS v(dispute_key, file_name, file_url, description, verification_status)
JOIN disputes d ON d.reason LIKE 'DISPUTE-MOCK:' || v.dispute_key || ' — %'
WHERE NOT EXISTS (SELECT 1 FROM dispute_evidence e WHERE e.dispute_id = d.id AND e.file_url = v.file_url);
