-- Dữ liệu mẫu (Mock Data) tiếng Việt đầy đủ cho 34 Bảng của hệ thống ScamShield

-- 1. Xóa sạch dữ liệu cũ (Xóa cẩn thận theo thứ tự để không dính Foreign Key)
TRUNCATE TABLE 
    audit_logs, official_scam_warnings, education_articles, 
    warning_cards, partner_official_alerts, notifications, user_alert_subscriptions, abuse_flags, 
    dispute_evidence, disputes, moderation_actions, report_evidence, reports, rule_definitions, 
    extracted_iocs, check_requests, whitelist_entries, partner_profiles, confirmed_indicators, 
    indicators, rate_limit_policies, quota_usage, quota_policies, guest_sessions, monthly_rewards, 
    reputation_transactions, refresh_tokens, users, scam_categories, reputation_ranks, roles 
CASCADE;

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
('GIA_DANH_CQCN', 'Giả danh cơ quan nhà nước', 'Giả công an, tòa án dọa bắt giam', 1, true, NOW(), NOW());

-- 4. users
-- LƯU Ý: Mật khẩu của tất cả user dưới đây đều là: Scam12345 (đã được băm bằng BCrypt)
INSERT INTO users (full_name, phone_number, email, password_hash, role_id, reputation_rank_id, status, reputation_points, created_at, updated_at) VALUES
('Nguyễn Văn A', '0987654321', 'nguyenvana@gmail.com', '$2a$10$.aK7Sz9/7Zsy9yzJHyTc3OFychCaGfhzAUDqL/9UVvHjlVtr7hYHa', (SELECT id FROM roles WHERE name='REGISTERED_USER'), (SELECT id FROM reputation_ranks WHERE name='Hiệp Sĩ'), 'ACTIVE', 150, NOW(), NOW()),
('Admin ScamShield', '0988888888', 'admin@scamshield.vn', '$2a$10$.aK7Sz9/7Zsy9yzJHyTc3OFychCaGfhzAUDqL/9UVvHjlVtr7hYHa', (SELECT id FROM roles WHERE name='ADMINISTRATOR'), (SELECT id FROM reputation_ranks WHERE name='Thủ Lĩnh'), 'ACTIVE', 9999, NOW(), NOW()),
('Shopee Partner', '19001234', 'partner@shopee.vn', '$2a$10$.aK7Sz9/7Zsy9yzJHyTc3OFychCaGfhzAUDqL/9UVvHjlVtr7hYHa', (SELECT id FROM roles WHERE name='BUSINESS_PARTNER'), null, 'ACTIVE', 0, NOW(), NOW());

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

-- 29. education_articles
INSERT INTO education_articles (title, slug, content, status, created_at, updated_at) VALUES
('Cách nhận biết lừa đảo qua điện thoại', 'cach-nhan-biet-lua-dao-dien-thoai', 'Đừng vội tin người xưng là công an...', 'PUBLISHED', NOW(), NOW());


-- 33. official_scam_warnings
INSERT INTO official_scam_warnings (title, content, status, created_at) VALUES
('Cảnh báo khẩn: Làn sóng lừa đảo mùa Tết', 'Nhiều đối tượng lợi dụng dịp lễ để giả danh tổ chức từ thiện...', 'PUBLISHED', NOW());

-- 34. audit_logs
INSERT INTO audit_logs (actor_user_id, action, entity_type, reason, created_at) VALUES
((SELECT id FROM users WHERE email='admin@scamshield.vn'), 'CREATE', 'USER', 'Tạo tài khoản quản trị hệ thống', NOW());
