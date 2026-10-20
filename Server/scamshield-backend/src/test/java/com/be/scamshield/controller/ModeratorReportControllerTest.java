package com.be.scamshield.controller;

import com.be.scamshield.config.SecurityConfig;
import com.be.scamshield.constant.ReportPriority;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.response.ModeratorEvidenceResponse;
import com.be.scamshield.dto.response.ModeratorQueueCountsResponse;
import com.be.scamshield.dto.response.ModeratorReportResponse;
import com.be.scamshield.security.CustomAccessDeniedHandler;
import com.be.scamshield.security.CustomUserDetailsService;
import com.be.scamshield.security.JwtAuthenticationEntryPoint;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IModeratorReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ModeratorReportController.class)
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class})
class ModeratorReportControllerTest {

    private static final String BASE_URL = "/api/moderator/reports";

    @MockitoBean
    private IModeratorReportService moderatorReportService;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private MockMvc mvc;

    private UsernamePasswordAuthenticationToken moderatorAuth;
    private UsernamePasswordAuthenticationToken userAuth;

    private ModeratorReportResponse mockReportResponse;

    @BeforeEach
    void setUp() {
        UserPrincipal modPrincipal = UserPrincipal.builder()
                .id(1L)
                .username("mod@scamshield.vn")
                .email("mod@scamshield.vn")
                .role("MODERATOR")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_MODERATOR")))
                .build();
        moderatorAuth = new UsernamePasswordAuthenticationToken(modPrincipal, null, modPrincipal.getAuthorities());

        UserPrincipal regularUser = UserPrincipal.builder()
                .id(2L)
                .username("user@example.com")
                .email("user@example.com")
                .role("REGISTERED_USER")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_REGISTERED_USER")))
                .build();
        userAuth = new UsernamePasswordAuthenticationToken(regularUser, null, regularUser.getAuthorities());

        mockReportResponse = ModeratorReportResponse.builder()
                .id("CS-2024-1891")
                .rawId(1891L)
                .targetIdentifier("0909 123 456")
                .targetType("PHONE")
                .category("Lừa đảo ngân hàng / OTP Phishing")
                .categoryId(5L)
                .reportCount(47)
                .reportedBy("nguyenthanh_vn")
                .reportedAt("15/01 14:32")
                .priority(ReportPriority.URGENT)
                .status("Pending")
                .aiScore(null)
                .aiRiskLevel(null)
                .aiConfidence(null)
                .evidenceCompleteness(85)
                .reporterProposal(null)
                .taxonomies(List.of("Lừa đảo ngân hàng / OTP Phishing"))
                .isLocked(false)
                .evidences(List.of(
                        ModeratorEvidenceResponse.builder()
                                .id("ev-1")
                                .rawId(1L)
                                .name("screenshot_1.jpg")
                                .type("image")
                                .url("https://storage.scamshield.vn/evidences/screenshot_1.jpg")
                                .build()
                ))
                .build();
    }

    @Test
    void getReportQueue_WhenAuthenticatedAsModerator_ReturnsSuccess() throws Exception {
        PaginatedResponse<ModeratorReportResponse> page = new PaginatedResponse<>();
        page.setData(List.of(mockReportResponse));
        page.setCurrentPage(0);
        page.setTotalItems(1);
        page.setPageSize(20);
        page.setTotalPages(1);

        when(moderatorReportService.getReportQueue(eq("ALL"), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        mvc.perform(get(BASE_URL)
                        .with(authentication(moderatorAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.data.data[0].id").value("CS-2024-1891"))
                .andExpect(jsonPath("$.data.data[0].targetIdentifier").value("0909 123 456"))
                .andExpect(jsonPath("$.data.data[0].priority").value("URGENT"))
                .andExpect(jsonPath("$.data.data[0].status").value("Pending"))
                .andExpect(jsonPath("$.data.data[0].aiScore").isEmpty())
                .andExpect(jsonPath("$.data.data[0].taxonomies[0]").value("Lừa đảo ngân hàng / OTP Phishing"));
    }

    @Test
    void getReportQueue_WhenRoleIsRegularUser_ReturnsForbidden() throws Exception {
        mvc.perform(get(BASE_URL)
                        .with(authentication(userAuth)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getReportQueue_WhenUnauthenticated_ReturnsUnauthorized() throws Exception {
        mvc.perform(get(BASE_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getQueueCounts_WhenModerator_ReturnsCounts() throws Exception {
        ModeratorQueueCountsResponse counts = ModeratorQueueCountsResponse.builder()
                .all(7L)
                .pending(3L)
                .inReview(1L)
                .locked(2L)
                .build();

        when(moderatorReportService.getQueueCounts()).thenReturn(counts);

        mvc.perform(get(BASE_URL + "/counts")
                        .with(authentication(moderatorAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.data.all").value(7))
                .andExpect(jsonPath("$.data.pending").value(3))
                .andExpect(jsonPath("$.data.inReview").value(1))
                .andExpect(jsonPath("$.data.locked").value(2));
    }
}
