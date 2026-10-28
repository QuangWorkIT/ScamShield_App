package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorAbuseEscalationFilterRequest;
import com.be.scamshield.dto.response.ModeratorAbuseEscalationResponse;
import com.be.scamshield.entity.AbuseFlag;
import com.be.scamshield.entity.Report;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.repository.AbuseFlagRepository;
import com.be.scamshield.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModeratorAbuseEscalationServiceImplTest {

    @Mock private AbuseFlagRepository abuseFlagRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private ModeratorAbuseEscalationServiceImpl service;

    @Test
    void mapsExistingFlagAndUsesBoundedStablePagination() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 10, 28, 9, 0);
        AbuseFlag flag = AbuseFlag.builder().id(41L).flagType("BULK_REPORTING")
                .severity("HIGH").reason("Gửi nhiều báo cáo thiếu căn cứ").evidence("Báo cáo liên quan")
                .status("OPEN").createdAt(createdAt).report(Report.builder().id(10281L).build()).build();
        when(userRepository.existsById(842L)).thenReturn(true);
        when(abuseFlagRepository.findByUserIdAndStatusIn(eq(842L), anyCollection(), any(Pageable.class)))
                .thenAnswer(invocation -> new PageImpl<>(List.of(flag), invocation.getArgument(2), 3));

        ModeratorAbuseEscalationFilterRequest filter = new ModeratorAbuseEscalationFilterRequest();
        filter.setSize(1);
        PaginatedResponse<ModeratorAbuseEscalationResponse> result = service.getEscalations(842L, filter);

        assertThat(result.getTotalItems()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.isHasNext()).isTrue();
        assertThat(result.isHasPrevious()).isFalse();
        assertThat(result.getData()).singleElement().satisfies(item -> {
            assertThat(item.getId()).isEqualTo(41L);
            assertThat(item.getEscalationCode()).isEqualTo("ESC-0041");
            assertThat(item.getUserId()).isEqualTo(842L);
            assertThat(item.getReportId()).isEqualTo(10281L);
            assertThat(item.getFlagType()).isEqualTo("BULK_REPORTING");
            assertThat(item.getSeverity()).isEqualTo("HIGH");
            assertThat(item.getReason()).isEqualTo(flag.getReason());
            assertThat(item.getEvidence()).isEqualTo(flag.getEvidence());
            assertThat(item.getStatus()).isEqualTo(AbuseFlagStatus.OPEN);
            assertThat(item.getCreatedAt()).isEqualTo(createdAt);
        });

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(abuseFlagRepository).findByUserIdAndStatusIn(eq(842L),
                eq(List.of("PENDING", "DISMISSED", "OPEN")), pageable.capture());
        assertThat(pageable.getValue().getPageNumber()).isZero();
        assertThat(pageable.getValue().getPageSize()).isEqualTo(1);
        assertThat(pageable.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }

    @Test
    void filtersByStatusAndAllowsLegacyFlagsWithoutReportOrNotes() {
        ModeratorAbuseEscalationFilterRequest filter = new ModeratorAbuseEscalationFilterRequest();
        filter.setStatus("PENDING");
        AbuseFlag flag = AbuseFlag.builder().id(1L).status("PENDING").build();
        when(userRepository.existsById(842L)).thenReturn(true);
        when(abuseFlagRepository.findByUserIdAndStatusIn(eq(842L), eq(List.of("PENDING")), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(flag)));

        assertThat(service.getEscalations(842L, filter).getData()).singleElement().satisfies(item -> {
            assertThat(item.getReportId()).isNull();
            assertThat(item.getReason()).isNull();
            assertThat(item.getEvidence()).isNull();
            assertThat(item.getStatus()).isEqualTo(AbuseFlagStatus.PENDING);
        });
    }

    @Test
    void existingAccountWithoutFlagsReturnsEmptyPage() {
        when(userRepository.existsById(842L)).thenReturn(true);
        when(abuseFlagRepository.findByUserIdAndStatusIn(eq(842L), anyCollection(), any(Pageable.class)))
                .thenAnswer(invocation -> Page.empty(invocation.getArgument(2)));

        var result = service.getEscalations(842L, new ModeratorAbuseEscalationFilterRequest());
        assertThat(result.getData()).isEmpty();
        assertThat(result.getTotalItems()).isZero();
        assertThat(result.getPageSize()).isEqualTo(20);
    }

    @Test
    void missingAccountIsNotMistakenForEmptyHistory() {
        assertThatThrownBy(() -> service.getEscalations(842L, new ModeratorAbuseEscalationFilterRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(abuseFlagRepository);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(longs = {0, -1})
    void rejectsNonPositiveOrMissingUserId(Long userId) {
        assertThatThrownBy(() -> service.getEscalations(userId, new ModeratorAbuseEscalationFilterRequest()))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(userRepository, abuseFlagRepository);
    }
}
