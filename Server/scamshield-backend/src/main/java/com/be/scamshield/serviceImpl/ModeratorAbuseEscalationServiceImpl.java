package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.ModeratorAbuseEscalationFilterRequest;
import com.be.scamshield.dto.response.ModeratorAbuseEscalationResponse;
import com.be.scamshield.entity.AbuseFlag;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.repository.AbuseFlagRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.service.IModeratorAbuseEscalationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ModeratorAbuseEscalationServiceImpl implements IModeratorAbuseEscalationService {

    private static final List<String> SUPPORTED_STATUSES = Arrays.stream(AbuseFlagStatus.values())
            .map(Enum::name)
            .toList();

    private final AbuseFlagRepository abuseFlagRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ModeratorAbuseEscalationResponse> getEscalations(
            Long userId, ModeratorAbuseEscalationFilterRequest filter) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("ID tài khoản phải là số nguyên dương");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + userId);
        }

        List<String> statuses = filter.getStatus() == null
                ? SUPPORTED_STATUSES : List.of(filter.getStatus());
        PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));

        return PaginatedResponse.buildPaginatedResponse(
                abuseFlagRepository.findByUserIdAndStatusIn(userId, statuses, pageable)
                        .map(flag -> mapToResponse(flag, userId)));
    }

    private ModeratorAbuseEscalationResponse mapToResponse(AbuseFlag flag, Long userId) {
        return ModeratorAbuseEscalationResponse.builder()
                .id(flag.getId())
                .escalationCode(String.format(Locale.ROOT, "ESC-%04d", flag.getId()))
                .userId(userId)
                .reportId(flag.getReport() == null ? null : flag.getReport().getId())
                .flagType(flag.getFlagType())
                .severity(flag.getSeverity())
                .reason(flag.getReason())
                .evidence(flag.getEvidence())
                .status(AbuseFlagStatus.valueOf(flag.getStatus()))
                .createdAt(flag.getCreatedAt())
                .build();
    }
}
