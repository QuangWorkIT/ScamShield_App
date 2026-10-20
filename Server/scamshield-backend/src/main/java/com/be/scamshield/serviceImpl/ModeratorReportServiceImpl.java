package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.ReportPriority;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.response.ModeratorEvidenceResponse;
import com.be.scamshield.dto.response.ModeratorQueueCountsResponse;
import com.be.scamshield.dto.response.ModeratorReportResponse;
import com.be.scamshield.entity.Indicator;
import com.be.scamshield.entity.Report;
import com.be.scamshield.entity.ReportEvidence;
import com.be.scamshield.entity.ScamCategory;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.repository.ReportEvidenceRepository;
import com.be.scamshield.repository.ReportRepository;
import com.be.scamshield.service.IModeratorReportService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModeratorReportServiceImpl implements IModeratorReportService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM HH:mm");
    private static final Pattern CASE_CODE_PATTERN = Pattern.compile("(?i)CS-\\d{4}-(\\d+)");

    private final ReportRepository reportRepository;
    private final ReportEvidenceRepository reportEvidenceRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ModeratorReportResponse> getReportQueue(
            String tab,
            String search,
            ReportPriority priority,
            Pageable pageable) {

        Specification<Report> spec = createFilterSpecification(tab, search, priority);
        Page<Report> pageResult = reportRepository.findAll(spec, pageable);

        if (pageResult.isEmpty()) {
            PaginatedResponse<ModeratorReportResponse> emptyResponse = new PaginatedResponse<>();
            emptyResponse.setData(Collections.emptyList());
            emptyResponse.setCurrentPage(pageResult.getNumber());
            emptyResponse.setTotalItems(pageResult.getTotalElements());
            emptyResponse.setPageSize(pageResult.getSize());
            emptyResponse.setTotalPages(pageResult.getTotalPages());
            emptyResponse.setHasNext(pageResult.hasNext());
            emptyResponse.setHasPrevious(pageResult.hasPrevious());
            return emptyResponse;
        }

        List<Long> reportIds = pageResult.getContent().stream()
                .map(Report::getId)
                .toList();

        Map<Long, List<ReportEvidence>> evidenceMap = reportEvidenceRepository.findByReportIdIn(reportIds)
                .stream()
                .collect(Collectors.groupingBy(ev -> ev.getReport().getId()));

        List<ModeratorReportResponse> responseList = pageResult.getContent().stream()
                .map(report -> mapToModeratorReportResponse(
                        report,
                        evidenceMap.getOrDefault(report.getId(), Collections.emptyList())
                ))
                .toList();

        PaginatedResponse<ModeratorReportResponse> response = new PaginatedResponse<>();
        response.setData(responseList);
        response.setCurrentPage(pageResult.getNumber());
        response.setTotalItems(pageResult.getTotalElements());
        response.setPageSize(pageResult.getSize());
        response.setTotalPages(pageResult.getTotalPages());
        response.setHasNext(pageResult.hasNext());
        response.setHasPrevious(pageResult.hasPrevious());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ModeratorQueueCountsResponse getQueueCounts() {
        long locked = reportRepository.countByModerationLockedTrue();
        long pending = reportRepository.countByStatusIgnoreCaseAndModerationLockedFalse("PENDING");
        long inReview = reportRepository.countByStatusIgnoreCaseAndModerationLockedFalse("IN_REVIEW");
        long all = reportRepository.count();

        return ModeratorQueueCountsResponse.builder()
                .all(all)
                .pending(pending)
                .inReview(inReview)
                .locked(locked)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ModeratorReportResponse getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ báo cáo với ID: " + id));

        List<ReportEvidence> evidences = reportEvidenceRepository.findByReportId(id);
        return mapToModeratorReportResponse(report, evidences);
    }

    private Specification<Report> createFilterSpecification(String tab, String search, ReportPriority priority) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Tab filtering
            if (StringUtils.hasText(tab) && !"ALL".equalsIgnoreCase(tab.trim())) {
                String cleanTab = tab.trim().toUpperCase();
                switch (cleanTab) {
                    case "PENDING" -> {
                        predicates.add(cb.equal(cb.upper(root.get("status")), "PENDING"));
                        predicates.add(cb.or(
                                cb.isNull(root.get("moderationLocked")),
                                cb.isFalse(root.get("moderationLocked"))
                        ));
                    }
                    case "IN_REVIEW" -> {
                        predicates.add(cb.equal(cb.upper(root.get("status")), "IN_REVIEW"));
                        predicates.add(cb.or(
                                cb.isNull(root.get("moderationLocked")),
                                cb.isFalse(root.get("moderationLocked"))
                        ));
                    }
                    case "LOCKED" -> {
                        predicates.add(cb.or(
                                cb.isTrue(root.get("moderationLocked")),
                                cb.equal(cb.upper(root.get("status")), "LOCKED")
                        ));
                    }
                    default -> {
                        predicates.add(cb.equal(cb.upper(root.get("status")), cleanTab));
                    }
                }
            }

            // 2. Priority filtering
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // 3. Search query filtering
            if (StringUtils.hasText(search)) {
                String trimmed = search.trim();
                String searchPattern = "%" + trimmed.toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();

                Long parsedId = parseSearchId(trimmed);
                if (parsedId != null) {
                    searchPredicates.add(cb.equal(root.get("id"), parsedId));
                }

                Join<Report, Indicator> indicatorJoin = root.join("indicator", JoinType.LEFT);
                searchPredicates.add(cb.like(cb.lower(indicatorJoin.get("displayValue")), searchPattern));
                searchPredicates.add(cb.like(cb.lower(indicatorJoin.get("normalizedValue")), searchPattern));

                Join<Report, ScamCategory> categoryJoin = root.join("category", JoinType.LEFT);
                searchPredicates.add(cb.like(cb.lower(categoryJoin.get("name")), searchPattern));

                Join<Report, User> userJoin = root.join("reporterUser", JoinType.LEFT);
                searchPredicates.add(cb.like(cb.lower(userJoin.get("fullName")), searchPattern));
                searchPredicates.add(cb.like(cb.lower(userJoin.get("email")), searchPattern));

                searchPredicates.add(cb.like(cb.lower(root.get("reportedMessage")), searchPattern));
                searchPredicates.add(cb.like(cb.lower(root.get("description")), searchPattern));

                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Long parseSearchId(String search) {
        if (search.matches("\\d+")) {
            try {
                return Long.parseLong(search);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        Matcher matcher = CASE_CODE_PATTERN.matcher(search);
        if (matcher.matches()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private ModeratorReportResponse mapToModeratorReportResponse(Report report, List<ReportEvidence> evidences) {
        int year = report.getCreatedAt() != null ? report.getCreatedAt().getYear() : 2024;
        String formattedCode = String.format("CS-%d-%04d", year, report.getId());

        String targetIdentifier = "N/A";
        String targetType = "UNKNOWN";
        if (report.getIndicator() != null) {
            targetType = report.getIndicator().getType();
            if (StringUtils.hasText(report.getIndicator().getDisplayValue())) {
                targetIdentifier = report.getIndicator().getDisplayValue();
            } else if (StringUtils.hasText(report.getIndicator().getNormalizedValue())) {
                targetIdentifier = report.getIndicator().getNormalizedValue();
            }
        } else if (StringUtils.hasText(report.getReportedMessage())) {
            targetIdentifier = report.getReportedMessage();
        }

        String categoryName = report.getCategory() != null ? report.getCategory().getName() : "Chưa phân loại";
        Long categoryId = report.getCategory() != null ? report.getCategory().getId() : null;

        String reportedBy = "Ẩn danh";
        if (report.getReporterUser() != null) {
            User user = report.getReporterUser();
            if (StringUtils.hasText(user.getEmail())) {
                reportedBy = user.getEmail().split("@")[0];
            } else if (StringUtils.hasText(user.getFullName())) {
                reportedBy = user.getFullName();
            }
        }

        String reportedAt = report.getCreatedAt() != null
                ? report.getCreatedAt().format(DATE_TIME_FORMATTER)
                : "";

        int completeness = report.getEvidenceCompleteness() != null
                ? report.getEvidenceCompleteness()
                : calculateEvidenceCompleteness(evidences);

        List<ModeratorEvidenceResponse> evidenceResponses = evidences.stream()
                .map(this::mapToModeratorEvidenceResponse)
                .toList();

        List<String> taxonomies = report.getCategory() != null
                ? List.of(report.getCategory().getName())
                : Collections.emptyList();

        String uiStatus = mapToUiStatus(report.getStatus(), report.getModerationLocked());

        return ModeratorReportResponse.builder()
                .id(formattedCode)
                .rawId(report.getId())
                .targetIdentifier(targetIdentifier)
                .targetType(targetType)
                .category(categoryName)
                .categoryId(categoryId)
                .reportCount(report.getReportCountSignal() != null ? report.getReportCountSignal() : 1)
                .reportedBy(reportedBy)
                .reportedAt(reportedAt)
                .priority(report.resolvePriority())
                .status(uiStatus)
                // Theo yêu cầu của người dùng: Hiện tại các trường phán quyết AI để trống trong DTO
                .aiScore(null)
                .aiRiskLevel(null)
                .aiConfidence(null)
                .evidenceCompleteness(completeness)
                .reporterProposal(StringUtils.hasText(report.getReporterProposal()) ? report.getReporterProposal() : report.getDescription())
                .evidences(evidenceResponses)
                .taxonomies(taxonomies)
                .isLocked(Boolean.TRUE.equals(report.getModerationLocked()))
                .build();
    }

    private ModeratorEvidenceResponse mapToModeratorEvidenceResponse(ReportEvidence ev) {
        String name = extractFileName(ev);
        String type = resolveEvidenceType(ev.getEvidenceType(), ev.getFileUrl());

        return ModeratorEvidenceResponse.builder()
                .id("ev-" + ev.getId())
                .rawId(ev.getId())
                .name(name)
                .type(type)
                .url(ev.getFileUrl())
                .build();
    }

    private String extractFileName(ReportEvidence ev) {
        if (StringUtils.hasText(ev.getFileName())) {
            return ev.getFileName();
        }
        if (StringUtils.hasText(ev.getFileUrl())) {
            String url = ev.getFileUrl();
            int slashIndex = url.lastIndexOf('/');
            if (slashIndex >= 0 && slashIndex < url.length() - 1) {
                String sub = url.substring(slashIndex + 1);
                int queryIndex = sub.indexOf('?');
                return queryIndex > 0 ? sub.substring(0, queryIndex) : sub;
            }
        }
        return "evidence_" + ev.getId() + ".jpg";
    }

    private String resolveEvidenceType(String evidenceType, String fileUrl) {
        String combined = ((evidenceType != null ? evidenceType : "") + " " + (fileUrl != null ? fileUrl : "")).toLowerCase();
        if (combined.contains("video") || combined.contains(".mp4") || combined.contains(".mov") || combined.contains(".webm")) {
            return "video";
        }
        if (combined.contains("pdf") || combined.contains("document") || combined.contains(".pdf")) {
            return "pdf";
        }
        return "image";
    }

    private int calculateEvidenceCompleteness(List<ReportEvidence> evidences) {
        if (evidences == null || evidences.isEmpty()) {
            return 10;
        }
        int score = 30;
        score += Math.min(evidences.size(), 3) * 15;
        boolean hasVerifiedOrOcr = evidences.stream().anyMatch(e ->
                StringUtils.hasText(e.getOcrText()) || "VERIFIED".equalsIgnoreCase(e.getVerificationStatus()));
        if (hasVerifiedOrOcr) {
            score += 15;
        }
        return Math.min(score, 100);
    }

    private String mapToUiStatus(String dbStatus, Boolean isLocked) {
        if (Boolean.TRUE.equals(isLocked) || "LOCKED".equalsIgnoreCase(dbStatus)) {
            return "Locked";
        }
        if (dbStatus == null) {
            return "Pending";
        }
        return switch (dbStatus.toUpperCase()) {
            case "PENDING" -> "Pending";
            case "IN_REVIEW" -> "In Review";
            case "APPROVED", "APPROVED_BLACKLIST", "VERIFIED" -> "Approved";
            case "REJECTED" -> "Rejected";
            default -> dbStatus;
        };
    }
}
