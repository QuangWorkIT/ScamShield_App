package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.admin.AdminAbuseEscalationFilterRequest;
import com.be.scamshield.dto.admin.AdminAbuseEscalationResponse;
import com.be.scamshield.entity.AbuseFlag;
import com.be.scamshield.entity.Report;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.repository.AbuseFlagRepository;
import com.be.scamshield.service.IAdminAbuseEscalationService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminAbuseEscalationServiceImpl implements IAdminAbuseEscalationService {

    private static final List<String> SUPPORTED_STATUSES = Arrays.stream(AbuseFlagStatus.values())
            .map(Enum::name).toList();
    private static final Pattern CODE_PATTERN = Pattern.compile("^(esc|u)-(\\d+)$");

    private final AbuseFlagRepository abuseFlagRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<AdminAbuseEscalationResponse> getEscalations(AdminAbuseEscalationFilterRequest filter) {
        // Keep Pageable unsorted so Spring Data does not replace the CASE-based priority order.
        PageRequest pageable = PageRequest.of(filter.getPage(), filter.getSize());
        if (pageable.getOffset() > Integer.MAX_VALUE) {
            throw new BadRequestException("Vị trí trang vượt quá giới hạn truy vấn, vui lòng chọn trang nhỏ hơn");
        }
        return PaginatedResponse.buildPaginatedResponse(
                abuseFlagRepository.findAll(createSpecification(filter), pageable).map(this::mapToResponse));
    }

    private Specification<AbuseFlag> createSpecification(AdminAbuseEscalationFilterRequest filter) {
        List<String> statuses = "ALL".equals(filter.getStatus()) ? SUPPORTED_STATUSES : List.of(filter.getStatus());
        String search = filter.getSearch() == null ? "" : filter.getSearch().strip().toLowerCase(Locale.ROOT);
        return (root, query, cb) -> {
            applySorting(root, query, cb, filter.getSort());
            // Report-only flags without a target account do not belong in this queue.
            Join<AbuseFlag, User> user = root.join("user", JoinType.INNER);
            Predicate status = root.get("status").in(statuses);
            if (search.isEmpty()) {
                return status;
            }
            Matcher code = CODE_PATTERN.matcher(search);
            if (code.matches()) {
                try {
                    long id = Long.parseLong(code.group(2));
                    return cb.and(status, "esc".equals(code.group(1))
                            ? cb.equal(root.get("id"), id) : cb.equal(user.get("id"), id));
                } catch (NumberFormatException ex) {
                    return cb.disjunction();
                }
            }
            String pattern = "%" + search.replace("!", "!!").replace("%", "!%")
                    .replace("_", "!_") + "%";
            return cb.and(status, cb.or(
                    cb.like(cb.lower(user.get("fullName")), pattern, '!'),
                    cb.like(cb.lower(user.get("email")), pattern, '!'),
                    cb.like(cb.lower(user.get("phoneNumber")), pattern, '!')));
        };
    }

    private void applySorting(Root<AbuseFlag> root, CriteriaQuery<?> query, CriteriaBuilder cb, String sort) {
        // Count queries must not inherit ORDER BY expressions used for the page content.
        if (query == null || Long.class.equals(query.getResultType()) || long.class.equals(query.getResultType())) {
            return;
        }
        String[] parts = sort.split(",");
        boolean ascending = "asc".equalsIgnoreCase(parts[1]);
        if ("priority".equalsIgnoreCase(parts[0])) {
            Expression<String> severity = cb.upper(cb.trim(root.get("severity")));
            Expression<Integer> knownPriority = cb.<Integer>selectCase()
                    .when(severity.in("HIGH", "MEDIUM", "LOW"), 0).otherwise(1);
            Expression<Integer> priority = cb.<Integer>selectCase()
                    .when(cb.equal(severity, "HIGH"), 3)
                    .when(cb.equal(severity, "MEDIUM"), 2)
                    .when(cb.equal(severity, "LOW"), 1).otherwise(0);
            query.orderBy(cb.asc(knownPriority), ascending ? cb.asc(priority) : cb.desc(priority),
                    cb.desc(root.get("createdAt")), cb.desc(root.get("id")));
        } else {
            query.orderBy(ascending ? cb.asc(root.get("createdAt")) : cb.desc(root.get("createdAt")),
                    cb.desc(root.get("id")));
        }
    }

    private AdminAbuseEscalationResponse mapToResponse(AbuseFlag flag) {
        User user = flag.getUser();
        User creator = flag.getCreatedBy();
        TreeSet<Long> reportIds = new TreeSet<>();
        for (Report report : flag.getRelatedReports()) {
            reportIds.add(report.getId());
        }
        if (flag.getReport() != null) {
            reportIds.add(flag.getReport().getId());
        }
        return AdminAbuseEscalationResponse.builder()
                .id(flag.getId()).escalationCode(String.format(Locale.ROOT, "ESC-%04d", flag.getId()))
                .userId(user.getId()).userCode(String.format(Locale.ROOT, "U-%05d", user.getId()))
                .fullName(user.getFullName()).email(user.getEmail()).userStatus(user.getStatus())
                .createdByUserId(creator == null ? null : creator.getId())
                .createdByName(creator == null ? null : creator.getFullName())
                .flagType(flag.getFlagType()).severity(flag.getSeverity())
                .reason(flag.getReason()).evidence(flag.getEvidence())
                .status(AbuseFlagStatus.valueOf(flag.getStatus())).reportIds(List.copyOf(reportIds))
                .createdAt(flag.getCreatedAt()).build();
    }
}
