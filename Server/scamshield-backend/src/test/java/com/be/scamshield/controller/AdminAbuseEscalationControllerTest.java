package com.be.scamshield.controller;

import com.be.scamshield.config.SecurityConfig;
import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.admin.AdminAbuseEscalationFilterRequest;
import com.be.scamshield.dto.admin.AdminAbuseEscalationResponse;
import com.be.scamshield.security.CustomAccessDeniedHandler;
import com.be.scamshield.security.CustomUserDetailsService;
import com.be.scamshield.security.JwtAuthenticationEntryPoint;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.service.IAdminAbuseEscalationService;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminAbuseEscalationController.class)
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class})
class AdminAbuseEscalationControllerTest {

    private static final String URL = "/api/admin/abuse-escalations";

    @Autowired private MockMvc mvc;
    @MockitoBean private IAdminAbuseEscalationService service;
    @MockitoBean private JwtTokenProvider tokenProvider;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void adminReceivesSafePaginatedResponseAndPendingDefaults() throws Exception {
        AdminAbuseEscalationResponse item = AdminAbuseEscalationResponse.builder()
                .id(41L).escalationCode("ESC-0041").userId(842L).userCode("U-00842")
                .fullName("Trần Minh Khôi").email("khoi@example.test").userStatus("ACTIVE")
                .createdByUserId(99L).createdByName("Mai Phương").status(AbuseFlagStatus.PENDING)
                .flagType("BULK_REPORTING").reportIds(List.of(10L, 11L)).build();
        when(service.getEscalations(any())).thenReturn(
                new PaginatedResponse<>(List.of(item), 0, 1, 1, 20, false, false));

        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.data.data[0].escalationCode").value("ESC-0041"))
                .andExpect(jsonPath("$.data.data[0].userId").value(842))
                .andExpect(jsonPath("$.data.data[0].userStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.data.data[0].createdByName").value("Mai Phương"))
                .andExpect(jsonPath("$.data.data[0].reportIds.length()").value(2))
                .andExpect(jsonPath("$.data.data[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data.data[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$.data.data[0].user").doesNotExist())
                .andExpect(jsonPath("$.data.currentPage").value(0))
                .andExpect(jsonPath("$.data.totalItems").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(20));

        ArgumentCaptor<AdminAbuseEscalationFilterRequest> filter = ArgumentCaptor.forClass(AdminAbuseEscalationFilterRequest.class);
        verify(service).getEscalations(filter.capture());
        assertThat(filter.getValue().getStatus()).isEqualTo("PENDING");
        assertThat(filter.getValue().getPage()).isZero();
        assertThat(filter.getValue().getSize()).isEqualTo(20);
        assertThat(filter.getValue().getSearch()).isNull();
        assertThat(filter.getValue().getSort()).isEqualTo("createdAt,desc");
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDING", "OPEN", "DISMISSED", "ALL"})
    void acceptsFiltersAndPagination(String filterStatus) throws Exception {
        when(service.getEscalations(any())).thenReturn(new PaginatedResponse<>(List.of(), 1, 0, 0, 10, false, true));
        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR"))
                        .param("status", filterStatus).param("page", "1").param("size", "10").param("search", "ESC-0041"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.data").isEmpty());
        ArgumentCaptor<AdminAbuseEscalationFilterRequest> filter = ArgumentCaptor.forClass(AdminAbuseEscalationFilterRequest.class);
        verify(service).getEscalations(filter.capture());
        assertThat(filter.getValue().getStatus()).isEqualTo(filterStatus);
        assertThat(filter.getValue().getSearch()).isEqualTo("ESC-0041");
        assertThat(filter.getValue().getPage()).isEqualTo(1);
        assertThat(filter.getValue().getSize()).isEqualTo(10);
    }

    @ParameterizedTest
    @ValueSource(strings = {"priority,desc", "priority,asc", "createdAt,asc", "createdAt,desc"})
    void forwardsSupportedSort(String sort) throws Exception {
        when(service.getEscalations(any())).thenReturn(new PaginatedResponse<>(List.of(), 0, 0, 0, 20, false, false));
        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR")).param("sort", sort))
                .andExpect(status().isOk());
        ArgumentCaptor<AdminAbuseEscalationFilterRequest> filter = ArgumentCaptor.forClass(AdminAbuseEscalationFilterRequest.class);
        verify(service).getEscalations(filter.capture());
        assertThat(filter.getValue().getSort()).isEqualTo(sort);
    }

    @ParameterizedTest
    @ValueSource(strings = {"priority,up", "severity,desc", "priority", "priority,desc,id,asc", ""})
    void rejectsUnsupportedSort(String sort) throws Exception {
        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR")).param("sort", sort))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        verifyNoInteractions(service);
    }

    @ParameterizedTest
    @CsvSource({"page,-1", "page,abc", "size,0", "size,101", "size,abc", "status,RESOLVED", "status,UNKNOWN", "status,''"})
    void invalidFiltersReturnBadRequest(String field, String value) throws Exception {
        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR")).param(field, value))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false));
        verifyNoInteractions(service);
    }

    @Test
    void searchLengthIsBounded() throws Exception {
        mvc.perform(get(URL).with(user("admin").roles("ADMINISTRATOR")).param("search", "x".repeat(101)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void anonymousRequestIsUnauthorized() throws Exception {
        mvc.perform(get(URL)).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @ParameterizedTest
    @ValueSource(strings = {"MODERATOR", "REGISTERED_USER", "BUSINESS_PARTNER", "GUEST"})
    void nonAdminCannotReadQueue(String role) throws Exception {
        mvc.perform(get(URL).with(user("other").roles(role))).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
}
