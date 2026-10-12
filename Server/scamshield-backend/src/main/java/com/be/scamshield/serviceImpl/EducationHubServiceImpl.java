package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.EducationContentType;
import com.be.scamshield.constant.EducationPublicationStatus;
import com.be.scamshield.constant.EducationSort;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.EducationContentFilterRequest;
import com.be.scamshield.dto.request.EducationHubFilterRequest;
import com.be.scamshield.dto.response.EducationContentResponse;
import com.be.scamshield.dto.response.EducationFiltersResponse;
import com.be.scamshield.dto.response.EducationHubResponse;
import com.be.scamshield.entity.EducationArticle;
import com.be.scamshield.entity.ScamCategory;
import com.be.scamshield.exception.ResourceNotFoundException;
import com.be.scamshield.repository.EducationArticleRepository;
import com.be.scamshield.service.IEducationHubService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
public class EducationHubServiceImpl implements IEducationHubService {
    private static final String TIMEZONE = "Asia/Ho_Chi_Minh";
    private final EducationArticleRepository repository;
    private final EntityManager entityManager;
    private final Clock clock;

    @Override
    public EducationHubResponse getHub(EducationHubFilterRequest filter) {
        LocalDateTime now = now();
        var scenarios = findContents(filter, EducationContentType.SCENARIO, null, 0, 4, EducationSort.LATEST, now);
        // General family cards stay visible when the user filters scenarios by category.
        var cards = findContents(new EducationHubFilterRequest(), EducationContentType.POCKET_CARD,
                null, 0, 3, EducationSort.DISPLAY_ORDER, now);
        return new EducationHubResponse(TIMEZONE, now, getFilters(), scenarios.getContent(), scenarios.getTotalElements(),
                cards.getContent(), cards.getTotalElements());
    }

    @Override
    public PaginatedResponse<EducationContentResponse> getContents(EducationContentFilterRequest filter) {
        EducationSort sort = filter.getSort() == null
                ? (filter.getContentType() == EducationContentType.POCKET_CARD ? EducationSort.DISPLAY_ORDER : EducationSort.LATEST)
                : filter.getSort();
        return PaginatedResponse.buildPaginatedResponse(findContents(filter, filter.getContentType(), filter.getKeyword(),
                filter.getPage(), filter.getSize(), sort, now()));
    }

    @Override
    public EducationContentResponse getContent(String slug) {
        Specification<EducationArticle> specification = publishedContent(new EducationHubFilterRequest(), null, null, now())
                .and((root, query, cb) -> cb.equal(root.get("slug"), slug));
        return repository.findAll(specification, PageRequest.of(0, 1)).stream().findFirst().map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nội dung Education Hub đã xuất bản"));
    }

    @Override
    public EducationFiltersResponse getFilters() {
        var categories = entityManager.createQuery("SELECT c FROM ScamCategory c WHERE c.isActive = true ORDER BY c.code", ScamCategory.class)
                .getResultList().stream().map(c -> new EducationContentResponse.Category(c.getCode(), c.getName())).toList();
        return new EducationFiltersResponse(List.of(EducationContentType.values()), categories);
    }

    private Page<EducationContentResponse> findContents(EducationHubFilterRequest filter, EducationContentType type,
                                                       String keyword, int page, int size, EducationSort sort, LocalDateTime now) {
        Sort ordering = sort == EducationSort.DISPLAY_ORDER
                ? Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.desc("publishedAt"), Sort.Order.asc("id"))
                : Sort.by(Sort.Order.desc("publishedAt"), Sort.Order.asc("displayOrder"), Sort.Order.desc("id"));
        return repository.findAll(publishedContent(filter, type, keyword, now), PageRequest.of(page, size, ordering)).map(this::toResponse);
    }

    private Specification<EducationArticle> publishedContent(EducationHubFilterRequest filter, EducationContentType type,
                                                             String keyword, LocalDateTime now) {
        return (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();
            conditions.add(cb.equal(root.get("status"), EducationPublicationStatus.PUBLISHED));
            conditions.add(cb.lessThanOrEqualTo(root.get("publishedAt"), now));
            conditions.add(root.get("contentType").in(EducationContentType.SCENARIO, EducationContentType.POCKET_CARD));
            conditions.add(cb.isNotNull(root.get("structuredContent")));
            Join<EducationArticle, ScamCategory> category = root.join("category", JoinType.LEFT);
            conditions.add(cb.or(cb.isNull(category.get("id")), cb.isTrue(category.get("isActive"))));
            if (type != null) conditions.add(cb.equal(root.get("contentType"), type));
            if (filter.getCategoryCode() != null) conditions.add(cb.equal(category.get("code"), filter.getCategoryCode()));
            if (keyword != null && !keyword.isBlank()) {
                String escaped = keyword.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
                String pattern = "%" + escaped + "%";
                conditions.add(cb.or(cb.like(cb.lower(root.get("title")), pattern, '\\'),
                        cb.like(cb.lower(root.get("summary")), pattern, '\\')));
            }
            return cb.and(conditions.toArray(Predicate[]::new));
        };
    }

    private EducationContentResponse toResponse(EducationArticle content) {
        ScamCategory category = content.getCategory();
        return new EducationContentResponse(content.getId(), content.getTitle(), content.getSlug(), content.getContentType(),
                content.getSummary(), content.getStructuredContent(),
                category == null ? null : new EducationContentResponse.Category(category.getCode(), category.getName()),
                content.getTag(), content.getBadgeLabel(), content.getImageUrl(), content.getPdfUrl(), content.getFormatLabel(),
                content.getImageWidth(), content.getImageHeight(), content.getDisplayOrder(), content.getPublishedAt(), content.getUpdatedAt());
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock.withZone(ZoneId.of(TIMEZONE)));
    }
}
