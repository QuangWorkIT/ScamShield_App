package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.ReportPriority;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorReportFilterRequest;
import com.be.scamshield.dto.response.ModeratorQueueCountsResponse;
import com.be.scamshield.dto.response.ModeratorReportResponse;
import com.be.scamshield.entity.*;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.repository.ReportEvidenceRepository;
import com.be.scamshield.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModeratorReportServiceImplTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportEvidenceRepository reportEvidenceRepository;

    @InjectMocks
    private ModeratorReportServiceImpl service;

    private Report testReport;
    private ReportEvidence testEvidence;
    private Indicator testIndicator;
    private ScamCategory testCategory;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(10L)
                .email("nguyenthanh_vn@example.com")
                .fullName("Nguyen Thanh")
                .phoneNumber("0909111222")
                .build();

        testIndicator = Indicator.builder()
                .id(100L)
                .type("PHONE")
                .normalizedValue("0909123456")
                .displayValue("0909 123 456")
                .build();

        testCategory = ScamCategory.builder()
                .id(5L)
                .code("BANK_OTP")
                .name("Lừa đảo ngân hàng / OTP Phishing")
                .build();

        testReport = Report.builder()
                .id(1891L)
                .reporterUser(testUser)
                .indicator(testIndicator)
                .category(testCategory)
                .status("PENDING")
                .priority(ReportPriority.URGENT)
                .priorityScore(new BigDecimal("94.0"))
                .reportCountSignal(47)
                .moderationLocked(false)
                .createdAt(LocalDateTime.of(2024, 1, 15, 14, 32))
                .updatedAt(LocalDateTime.of(2024, 1, 15, 14, 32))
                .description("Đối tượng giả danh nhân viên ngân hàng OTP")
                .build();

        testEvidence = ReportEvidence.builder()
                .id(1L)
                .report(testReport)
                .fileName("screenshot_1.jpg")
                .fileUrl("https://storage.scamshield.vn/evidences/screenshot_1.jpg")
                .evidenceType("IMAGE")
                .verificationStatus("PENDING")
                .createdAt(LocalDateTime.of(2024, 1, 15, 14, 32))
                .build();
    }

    @Test
    void getReportQueue_Success_MapsAllFieldsCorrectlyAndLeavesAiFieldsEmpty() {
        Pageable pageable = PageRequest.of(0, 20);
        when(reportRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(testReport), pageable, 1));
        when(reportEvidenceRepository.findByReportIdIn(List.of(1891L)))
                .thenReturn(List.of(testEvidence));

        ModeratorReportFilterRequest filter = ModeratorReportFilterRequest.builder().tab("ALL").build();
        PaginatedResponse<ModeratorReportResponse> response = service.getReportQueue(filter, pageable);

        assertThat(response.getData()).hasSize(1);
        ModeratorReportResponse item = response.getData().get(0);

        assertThat(item.getId()).isEqualTo("CS-2024-1891");
        assertThat(item.getRawId()).isEqualTo(1891L);
        assertThat(item.getTargetIdentifier()).isEqualTo("0909 123 456");
        assertThat(item.getTargetType()).isEqualTo("PHONE");
        assertThat(item.getCategory()).isEqualTo("Lừa đảo ngân hàng / OTP Phishing");
        assertThat(item.getCategoryId()).isEqualTo(5L);
        assertThat(item.getReportCount()).isEqualTo(47);
        assertThat(item.getReportedBy()).isEqualTo("nguyenthanh_vn");
        assertThat(item.getReportedAt()).isEqualTo("15/01 14:32");
        assertThat(item.getPriority()).isEqualTo(ReportPriority.URGENT);
        assertThat(item.getStatus()).isEqualTo("Pending");
        assertThat(item.getIsLocked()).isFalse();

        // Theo yêu cầu của người dùng: Hiện tại các fields này để trống trong dto
        assertThat(item.getAiScore()).isNull();
        assertThat(item.getAiRiskLevel()).isNull();
        assertThat(item.getAiConfidence()).isNull();

        // Single ScamCategory mapping in taxonomies
        assertThat(item.getTaxonomies()).containsExactly("Lừa đảo ngân hàng / OTP Phishing");

        // Evidence mapping
        assertThat(item.getEvidences()).hasSize(1);
        assertThat(item.getEvidences().get(0).getId()).isEqualTo("ev-1");
        assertThat(item.getEvidences().get(0).getName()).isEqualTo("screenshot_1.jpg");
        assertThat(item.getEvidences().get(0).getType()).isEqualTo("image");
    }

    @Test
    void getReportQueue_EmptyResult_ReturnsEmptyPaginatedResponse() {
        Pageable pageable = PageRequest.of(0, 20);
        when(reportRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), pageable, 0));

        ModeratorReportFilterRequest filter = ModeratorReportFilterRequest.builder().tab("ALL").build();
        PaginatedResponse<ModeratorReportResponse> response = service.getReportQueue(filter, pageable);

        assertThat(response.getData()).isEmpty();
        assertThat(response.getTotalItems()).isEqualTo(0);
    }

    @Test
    void getQueueCounts_Success_ReturnsAggregatedCounts() {
        when(reportRepository.count()).thenReturn(7L);
        when(reportRepository.countByStatusIgnoreCaseAndModerationLockedFalse("PENDING")).thenReturn(3L);
        when(reportRepository.countByStatusIgnoreCaseAndModerationLockedFalse("IN_REVIEW")).thenReturn(1L);
        when(reportRepository.countByModerationLockedTrueOrStatusIgnoreCase("LOCKED")).thenReturn(2L);

        ModeratorQueueCountsResponse counts = service.getQueueCounts();

        assertThat(counts.getAll()).isEqualTo(7L);
        assertThat(counts.getPending()).isEqualTo(3L);
        assertThat(counts.getInReview()).isEqualTo(1L);
        assertThat(counts.getLocked()).isEqualTo(2L);
    }

    @Test
    void getReportById_Success_ReturnsReportDetail() {
        when(reportRepository.findById(1891L)).thenReturn(Optional.of(testReport));
        when(reportEvidenceRepository.findByReportId(1891L)).thenReturn(List.of(testEvidence));

        ModeratorReportResponse result = service.getReportById(1891L);

        assertThat(result.getId()).isEqualTo("CS-2024-1891");
        assertThat(result.getTargetIdentifier()).isEqualTo("0909 123 456");
        assertThat(result.getEvidences()).hasSize(1);
    }

    @Test
    void getReportById_NotFound_ThrowsResourceNotFoundException() {
        when(reportRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getReportById(9999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("9999");
    }

    @Test
    void resolvePriority_WhenPriorityIsNull_FallsBackToPriorityScore() {
        testReport.setPriority(null);
        testReport.setPriorityScore(Report.PRIORITY_THRESHOLD_URGENT);
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.URGENT);

        testReport.setPriorityScore(new BigDecimal("85.0"));
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.URGENT);

        testReport.setPriorityScore(Report.PRIORITY_THRESHOLD_HIGH);
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.HIGH);

        testReport.setPriorityScore(new BigDecimal("60.0"));
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.HIGH);

        testReport.setPriorityScore(Report.PRIORITY_THRESHOLD_HIGH.subtract(new BigDecimal("0.1")));
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.NORMAL);

        testReport.setPriorityScore(null);
        assertThat(testReport.resolvePriority()).isEqualTo(ReportPriority.NORMAL);
    }

    @Test
    void getReportQueue_WithPriorityFilter_BuildsValidSpecification() {
        Pageable pageable = PageRequest.of(0, 20);
        when(reportRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(testReport), pageable, 1));
        when(reportEvidenceRepository.findByReportIdIn(List.of(1891L)))
                .thenReturn(List.of(testEvidence));

        for (ReportPriority p : ReportPriority.values()) {
            ModeratorReportFilterRequest filter = ModeratorReportFilterRequest.builder()
                    .tab("ALL")
                    .priority(p)
                    .build();
            PaginatedResponse<ModeratorReportResponse> response = service.getReportQueue(filter, pageable);
            assertThat(response.getData()).hasSize(1);
        }
    }
}
