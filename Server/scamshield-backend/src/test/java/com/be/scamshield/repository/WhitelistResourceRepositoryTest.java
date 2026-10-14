package com.be.scamshield.repository;

import com.be.scamshield.constant.PartnerVerificationStatus;
import com.be.scamshield.entity.PartnerProfile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class WhitelistResourceRepositoryTest {
    @Autowired
    private WhitelistResourceRepository repository;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @Transactional
    void searchesWithoutDeletedCollectionTables() {
        Long oldTableCount = jdbc.queryForObject("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE LOWER(table_name) IN ('partner_profile_domains', 'partner_profile_hotlines',
                                            'partner_profile_brand_names')
                """, Long.class);
        assertThat(oldTableCount).isZero();

        jdbc.update("""
                INSERT INTO users (full_name, phone_number, email, password_hash, is_phone_verified,
                                   status, reputation_points, created_at, updated_at)
                VALUES ('Example User', '0912345678', 'owner@example.vn', 'hash', true,
                        'ACTIVE', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        Long userId = jdbc.queryForObject("SELECT id FROM users WHERE email = 'owner@example.vn'", Long.class);
        jdbc.update("""
                INSERT INTO partner_profiles (user_id, legal_name, brand_name, partner_type,
                                              verification_status, created_at, verified_at,
                                              official_domain, official_hotline, sms_brand_name)
                VALUES (?, 'Example Company', 'Example', 'BUSINESS', 'VERIFIED', CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP, 'example.vn', '18008098', 'EXAMPLE_SMS')
                """, userId);
        Long partnerId = jdbc.queryForObject("SELECT id FROM partner_profiles WHERE user_id = ?", Long.class, userId);
        jdbc.update("""
                INSERT INTO indicators (type, normalized_value, created_at, updated_at)
                VALUES ('URL', 'example.vn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        Long indicatorId = jdbc.queryForObject("SELECT id FROM indicators WHERE normalized_value = 'example.vn'", Long.class);
        jdbc.update("""
                INSERT INTO whitelist_entries (partner_id, indicator_id, verification_status,
                                               auto_lock_moderation, created_at)
                VALUES (?, ?, 'VERIFIED', true, CURRENT_TIMESTAMP)
                """, partnerId, indicatorId);

        for (String keyword : new String[]{"%example.vn%", "%18008098%", "%example_sms%"}) {
            var page = repository.findVerifiedPartners(PartnerVerificationStatus.VERIFIED,
                    keyword, "name", PageRequest.of(0, 5));
            assertThat(page.getContent()).extracting(PartnerProfile::getId).containsExactly(partnerId);
        }
    }
}
