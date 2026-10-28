package com.be.scamshield.controller;

import com.be.scamshield.config.SecurityConfig;
import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorAbuseEscalationFilterRequest;
import com.be.scamshield.dto.response.ModeratorAbuseEscalationResponse;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.security.CustomAccessDeniedHandler;
import com.be.scamshield.security.CustomUserDetailsService;
import com.be.scamshield.security.JwtAuthenticationEntryPoint;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.service.IModeratorAbuseEscalationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ModeratorAbuseEscalationController.class)
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class})
class ModeratorAbuseEscalationControllerTest {

    private static final String URL = "/api/moderator/users/842/abuse-escalations";

    @Autowired private MockMvc mvc;
    @MockitoBean private IModeratorAbuseEscalationService service;
    @MockitoBean private JwtTokenProvider tokenProvider;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void moderatorReceivesPaginatedHistoryWithDefaults() throws Exception {
        ModeratorAbuseEscalationResponse item = ModeratorAbuseEscalationResponse.builder()
                .id(41L).escalationCode("ESC-0041").userId(842L).reportId(10281L)
                .flagType("BULK_REPORTING").severity("HIGH").reason("Gửi báo cáo hàng loạt")
                .evidence("Đối chiếu các báo cáo liên quan").status(AbuseFlagStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 10, 28, 9, 0)).build();
        when(service.getEscalations(eq(842L), any())).thenReturn(
                new PaginatedResponse<>(List.of(item), 0, 1, 1, 20, false, false));

        mvc.perform(get(URL).with(user("moderator").roles("MODERATOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.data.data[0].id").value(41))
                .andExpect(jsonPath("$.data.data[0].escalationCode").value("ESC-0041"))
                .andExpect(jsonPath("$.data.data[0].userId").value(842))
                .andExpect(jsonPath("$.data.data[0].reportId").value(10281))
                .andExpect(jsonPath("$.data.data[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data.data[0].user").doesNotExist())
                .andExpect(jsonPath("$.data.data[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$.data.totalItems").value(1))
                .andExpect(jsonPath("$.data.currentPage").value(0))
                .andExpect(jsonPath("$.data.pageSize").value(20));

        ArgumentCaptor<ModeratorAbuseEscalationFilterRequest> filter =
                ArgumentCaptor.forClass(ModeratorAbuseEscalationFilterRequest.class);
        verify(service).getEscalations(eq(842L), filter.capture());
        assertThat(filter.getValue().getPage()).isZero();
        assertThat(filter.getValue().getSize()).isEqualTo(20);
        assertThat(filter.getValue().getStatus()).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDING", "DISMISSED", "OPEN"})
    void forwardsSupportedStatusAndPagination(String filterStatus) throws Exception {
        when(service.getEscalations(eq(842L), any())).thenReturn(
                new PaginatedResponse<>(List.of(), 2, 0, 0, 10, false, true));

        mvc.perform(get(URL).with(user("moderator").roles("MODERATOR"))
                        .param("status", filterStatus).param("page", "2").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.data").isEmpty());

        ArgumentCaptor<ModeratorAbuseEscalationFilterRequest> filter =
                ArgumentCaptor.forClass(ModeratorAbuseEscalationFilterRequest.class);
        verify(service).getEscalations(eq(842L), filter.capture());
        assertThat(filter.getValue().getStatus()).isEqualTo(filterStatus);
        assertThat(filter.getValue().getPage()).isEqualTo(2);
        assertThat(filter.getValue().getSize()).isEqualTo(10);
    }

    @ParameterizedTest
    @CsvSource({"page,-1", "page,abc", "size,0", "size,101", "size,abc", "status,RESOLVED", "status,UNKNOWN"})
    void rejectsInvalidQueryParameters(String name, String value) throws Exception {
        mvc.perform(get(URL).with(user("moderator").roles("MODERATOR")).param(name, value))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.isSuccess").value(false));
        verifyNoInteractions(service);
    }

    @Test
    void rejectsNonNumericUserId() throws Exception {
        mvc.perform(get("/api/moderator/users/abc/abuse-escalations")
                        .with(user("moderator").roles("MODERATOR")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.isSuccess").value(false));
        verifyNoInteractions(service);
    }

    @Test
    void returnsNotFoundForMissingAccount() throws Exception {
        when(service.getEscalations(eq(842L), any()))
                .thenThrow(new ResourceNotFoundException("Không tìm thấy tài khoản với ID: 842"));
        mvc.perform(get(URL).with(user("moderator").roles("MODERATOR")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.isSuccess").value(false));
    }

    @Test
    void returnsBadRequestForNonPositiveUserId() throws Exception {
        when(service.getEscalations(eq(0L), any()))
                .thenThrow(new BadRequestException("ID tài khoản phải là số nguyên dương"));
        mvc.perform(get("/api/moderator/users/0/abuse-escalations")
                        .with(user("moderator").roles("MODERATOR")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.isSuccess").value(false));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mvc.perform(get(URL)).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @ParameterizedTest
    @ValueSource(strings = {"REGISTERED_USER", "BUSINESS_PARTNER", "GUEST", "ADMINISTRATOR"})
    void rejectsNonModeratorRoles(String role) throws Exception {
        mvc.perform(get(URL).with(user("other").roles(role)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
}
