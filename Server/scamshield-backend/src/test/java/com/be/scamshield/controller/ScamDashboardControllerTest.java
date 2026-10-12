package com.be.scamshield.controller;

import com.be.scamshield.config.SecurityConfig;
import com.be.scamshield.constant.ScamDashboardPeriod;
import com.be.scamshield.dto.request.ScamDashboardFilterRequest;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.security.CustomAccessDeniedHandler;
import com.be.scamshield.security.CustomUserDetailsService;
import com.be.scamshield.security.JwtAuthenticationEntryPoint;
import com.be.scamshield.security.JwtTokenProvider;
import com.be.scamshield.service.IScamDashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ScamDashboardController.class)
@Import({SecurityConfig.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class})
class ScamDashboardControllerTest {
    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private IScamDashboardService service;
    @MockitoBean
    private JwtTokenProvider tokenProvider;
    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void permitsAnonymousReadsAndDefaultsToLastThirtyDays() throws Exception {
        mvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.isSuccess").value(true));
        ArgumentCaptor<ScamDashboardFilterRequest> argument = ArgumentCaptor.forClass(ScamDashboardFilterRequest.class);
        verify(service).getSummary(argument.capture());
        assertThat(argument.getValue().getPeriod()).isEqualTo(ScamDashboardPeriod.LAST_30_DAYS);
        mvc.perform(get("/api/dashboard/filters"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.isSuccess").value(true));
        verify(service).getFilters();
    }

    @Test
    void bindsCombinedQuarterProvinceCategoryAndIndicatorFilters() throws Exception {
        mvc.perform(get("/api/dashboard/summary").param("period", "QUARTER").param("year", "2025")
                        .param("quarter", "1").param("regionCode", "79").param("categoryCode", "VIEC_LAM").param("indicatorType", "URL"))
                .andExpect(status().isOk());
        ArgumentCaptor<ScamDashboardFilterRequest> argument = ArgumentCaptor.forClass(ScamDashboardFilterRequest.class);
        verify(service).getSummary(argument.capture());
        var filter = argument.getValue();
        assertThat(filter.getPeriod()).isEqualTo(ScamDashboardPeriod.QUARTER);
        assertThat(filter.getYear()).isEqualTo(2025);
        assertThat(filter.getQuarter()).isEqualTo(1);
        assertThat(filter.getRegionCode()).isEqualTo("79");
        assertThat(filter.getCategoryCode()).isEqualTo("VIEC_LAM");
        assertThat(filter.getIndicatorType()).isEqualTo("URL");
    }

    @ParameterizedTest
    @CsvSource({"period,UNKNOWN", "period,''", "year,abc", "year,1999", "year,9999", "quarter,0", "quarter,5",
            "fromDate,2025-02-30", "toDate,not-a-date", "regionCode,HN", "categoryCode,'bad code'", "indicatorType,url"})
    void rejectsInvalidQueryParametersAsJsonBadRequest(String field, String value) throws Exception {
        mvc.perform(get("/api/dashboard/summary").param(field, value))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.data." + field).exists());
        verifyNoInteractions(service);
    }

    @Test
    void wrapsInvalidFilterCombinationsInBadRequestResponse() throws Exception {
        when(service.getSummary(any())).thenThrow(new BadRequestException("Vui lòng cung cấp year và quarter khi lọc theo quý"));
        mvc.perform(get("/api/dashboard/summary").param("period", "QUARTER"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.message").value("Vui lòng cung cấp year và quarter khi lọc theo quý"));
    }

    @Test
    void doesNotMakeOtherRoutesOrMutationMethodsPublic() throws Exception {
        mvc.perform(get("/api/dashboard/private")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/dashboard/summary")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}
