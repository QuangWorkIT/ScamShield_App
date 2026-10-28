package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.AbuseFlagStatus;
import com.be.scamshield.dto.admin.AdminAbuseEscalationFilterRequest;
import com.be.scamshield.entity.AbuseFlag;
import com.be.scamshield.entity.Indicator;
import com.be.scamshield.entity.Report;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.service.IAdminAbuseEscalationService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest(showSql = false, properties = {
        "spring.test.database.replace=none",
        "spring.datasource.url=jdbc:h2:mem:admin-abuse-queue-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.jpa.properties.hibernate.hbm2ddl.halt_on_error=true"
})
@Import(AdminAbuseEscalationServiceImpl.class)
@ActiveProfiles("test")
class AdminAbuseEscalationPersistenceTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 28, 9, 0);

    @Autowired private IAdminAbuseEscalationService service;
    @Autowired private EntityManager entityManager;
    private User target;
    private User other;
    private User moderator;

    @BeforeEach
    void setUp() {
        target = account("Trần Minh Khôi", "khoi.tran@example.test", "0912345601");
        other = account("Lê Thanh Hà", "ha.le@example.test", "0912345602");
        moderator = account("Mai Phương", "moderator@example.test", "0912345603");
    }

    @Test
    void defaultPendingQueueIncludesAllAccountsWithStablePaginationAndNoDuplicateCounts() {
        AbuseFlag oldest = flag(target, "PENDING", NOW.minusDays(1));
        AbuseFlag firstAtSameTime = flag(other, "PENDING", NOW);
        AbuseFlag secondAtSameTime = flag(target, "PENDING", NOW);
        Report firstReport = report(target, "first.example");
        Report secondReport = report(target, "second.example");
        secondAtSameTime.setReport(firstReport);
        secondAtSameTime.setRelatedReports(new ArrayList<>(List.of(secondReport, firstReport)));
        flag(target, "OPEN", NOW.plusDays(1));
        flag(target, "DISMISSED", NOW.plusDays(1));
        flag(target, "RESOLVED", NOW.plusDays(1));
        flag(null, "PENDING", NOW.plusDays(1));
        flushAndClear();

        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSize(2);
        var firstPage = service.getEscalations(filter);
        assertThat(firstPage.getTotalItems()).isEqualTo(3);
        assertThat(firstPage.getTotalPages()).isEqualTo(2);
        assertThat(firstPage.isHasNext()).isTrue();
        assertThat(firstPage.getData()).extracting(item -> item.getId())
                .containsExactly(secondAtSameTime.getId(), firstAtSameTime.getId());
        assertThat(firstPage.getData().getFirst().getReportIds()).containsExactly(firstReport.getId(), secondReport.getId());
        assertThat(firstPage.getData().getFirst().getCreatedByName()).isEqualTo("Mai Phương");
        assertThat(firstPage.getData().get(1).getUserId()).isEqualTo(other.getId());

        filter.setPage(1);
        var secondPage = service.getEscalations(filter);
        assertThat(secondPage.getData()).extracting(item -> item.getId()).containsExactly(oldest.getId());
        assertThat(secondPage.getTotalItems()).isEqualTo(3);
        assertThat(secondPage.isHasPrevious()).isTrue();
        assertThat(secondPage.isHasNext()).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"priority,desc", "priority,asc"})
    void priorityOrderUsesSeverityBeforePaginationWithStableTiesAndUnknownValuesLast(String sort) {
        AbuseFlag low = flag(target, "PENDING", NOW.plusDays(2));
        low.setSeverity("LOW");
        AbuseFlag medium = flag(target, "PENDING", NOW);
        medium.setSeverity("MEDIUM");
        AbuseFlag oldHigh = flag(target, "PENDING", NOW.minusDays(5));
        oldHigh.setSeverity(" high ");
        AbuseFlag firstHighAtSameTime = flag(other, "PENDING", NOW.minusDays(1));
        firstHighAtSameTime.setSeverity("HIGH");
        AbuseFlag secondHighAtSameTime = flag(target, "PENDING", NOW.minusDays(1));
        secondHighAtSameTime.setSeverity("HIGH");
        AbuseFlag unknown = flag(target, "PENDING", NOW.plusDays(3));
        unknown.setSeverity("LEGACY_UNKNOWN");
        flag(other, "OPEN", NOW.plusDays(4)).setSeverity("HIGH");
        flushAndClear();

        List<Long> expected = sort.endsWith("desc")
                ? List.of(secondHighAtSameTime.getId(), firstHighAtSameTime.getId(), oldHigh.getId(), medium.getId(), low.getId(), unknown.getId())
                : List.of(low.getId(), medium.getId(), secondHighAtSameTime.getId(), firstHighAtSameTime.getId(), oldHigh.getId(), unknown.getId());
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSort(sort);
        filter.setSize(2);
        List<Long> actual = new ArrayList<>();
        for (int page = 0; page < 3; page++) {
            filter.setPage(page);
            var result = service.getEscalations(filter);
            assertThat(result.getTotalItems()).isEqualTo(6);
            assertThat(result.getTotalPages()).isEqualTo(3);
            actual.addAll(result.getData().stream().map(item -> item.getId()).toList());
        }
        assertThat(actual).containsExactlyElementsOf(expected);

        filter.setSearch(target.getEmail());
        filter.setPage(0);
        filter.setSize(20);
        assertThat(service.getEscalations(filter).getData()).extracting(item -> item.getId())
                .containsExactlyElementsOf(expected.stream().filter(id -> !id.equals(firstHighAtSameTime.getId())).toList());
    }

    @Test
    void creationTimeCanBeSortedAscendingWithDeterministicIdTies() {
        AbuseFlag old = flag(target, "PENDING", NOW.minusDays(2));
        AbuseFlag first = flag(target, "PENDING", NOW);
        AbuseFlag second = flag(other, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSort("createdAt,asc");
        assertThat(service.getEscalations(filter).getData()).extracting(item -> item.getId())
                .containsExactly(old.getId(), second.getId(), first.getId());
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDING", "OPEN", "DISMISSED"})
    void filtersEachSupportedStatus(String status) {
        flag(target, "PENDING", NOW);
        flag(target, "OPEN", NOW);
        flag(other, "DISMISSED", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setStatus(status);
        var result = service.getEscalations(filter);
        assertThat(result.getTotalItems()).isEqualTo(1);
        assertThat(result.getData()).singleElement().satisfies(item ->
                assertThat(item.getStatus()).isEqualTo(AbuseFlagStatus.valueOf(status)));
    }

    @Test
    void allFilterExcludesLegacyResolvedAndFlagsWithoutAccount() {
        flag(target, "PENDING", NOW);
        flag(target, "OPEN", NOW);
        flag(other, "DISMISSED", NOW);
        flag(other, "RESOLVED", NOW);
        flag(null, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setStatus("ALL");
        var result = service.getEscalations(filter);
        assertThat(result.getTotalItems()).isEqualTo(3);
        assertThat(result.getData()).extracting(item -> item.getStatus())
                .containsExactlyInAnyOrder(AbuseFlagStatus.PENDING, AbuseFlagStatus.OPEN, AbuseFlagStatus.DISMISSED);
    }

    @ParameterizedTest
    @ValueSource(strings = {"  KHOI.TRAN@EXAMPLE.TEST  ", "minh khôi", "0912345601"})
    void searchesAccountFieldsIgnoringCaseAndOuterWhitespace(String search) {
        AbuseFlag expected = flag(target, "PENDING", NOW);
        flag(other, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSearch(search);
        assertThat(service.getEscalations(filter).getData()).singleElement().satisfies(item ->
                assertThat(item.getId()).isEqualTo(expected.getId()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ESC", "esc", "U", "u"})
    void searchesDisplayCodesByExactNumericId(String prefix) {
        flag(other, "PENDING", NOW);
        AbuseFlag expected = flag(target, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSearch(prefix + "-000" + (prefix.equalsIgnoreCase("esc") ? expected.getId() : target.getId()));
        assertThat(service.getEscalations(filter).getData()).singleElement().satisfies(item ->
                assertThat(item.getId()).isEqualTo(expected.getId()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"%", "_", "!"})
    void searchTreatsSqlWildcardCharactersAsLiteralText(String search) {
        User special = account("Người dùng %_! đặc biệt", "special@example.test", "0912345604");
        AbuseFlag expected = flag(special, "PENDING", NOW);
        flag(other, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSearch(search);
        assertThat(service.getEscalations(filter).getData()).singleElement().satisfies(item ->
                assertThat(item.getId()).isEqualTo(expected.getId()));
    }

    @Test
    void oversizedDisplayCodeReturnsEmptyPageRatherThanServerError() {
        flag(target, "PENDING", NOW);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setSearch("ESC-999999999999999999999999999999");
        assertThat(service.getEscalations(filter).getData()).isEmpty();
    }

    @Test
    void emptyQueueAndOutOfRangePageReturnAccurateMetadata() {
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        assertThat(service.getEscalations(filter).getTotalItems()).isZero();
        flag(target, "PENDING", NOW);
        flag(other, "PENDING", NOW);
        flushAndClear();
        filter.setPage(10);
        filter.setSize(2);
        filter.setSearch("   ");
        var result = service.getEscalations(filter);
        assertThat(result.getData()).isEmpty();
        assertThat(result.getTotalItems()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(1);
    }

    @Test
    void legacyPrimaryReportAndAccountStatusArePreservedWithoutCreator() {
        target.setStatus("SUSPENDED");
        AbuseFlag flag = flag(target, "OPEN", NOW);
        flag.setCreatedBy(null);
        flag.setFlagType("SPAM");
        Report legacyReport = report(target, "legacy.example");
        flag.setReport(legacyReport);
        flushAndClear();
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setStatus("OPEN");
        assertThat(service.getEscalations(filter).getData()).singleElement().satisfies(item -> {
            assertThat(item.getReportIds()).containsExactly(legacyReport.getId());
            assertThat(item.getCreatedByUserId()).isNull();
            assertThat(item.getCreatedByName()).isNull();
            assertThat(item.getUserStatus()).isEqualTo("SUSPENDED");
            assertThat(item.getFlagType()).isEqualTo("SPAM");
            assertThat(item.getUserCode()).isEqualTo(String.format("U-%05d", target.getId()));
        });
    }

    @Test
    void rejectsOffsetBeyondJpaIntegerLimit() {
        AdminAbuseEscalationFilterRequest filter = new AdminAbuseEscalationFilterRequest();
        filter.setPage(Integer.MAX_VALUE);
        filter.setSize(100);
        assertThatThrownBy(() -> service.getEscalations(filter)).isInstanceOf(BadRequestException.class);
    }

    private User account(String name, String email, String phone) {
        User user = User.builder().fullName(name).email(email).phoneNumber(phone).passwordHash("test-hash")
                .status("ACTIVE").reputationPoints(0).build();
        entityManager.persist(user);
        return user;
    }

    private AbuseFlag flag(User user, String status, LocalDateTime createdAt) {
        AbuseFlag flag = AbuseFlag.builder().user(user).createdBy(moderator).flagType("BULK_REPORTING")
                .severity("MEDIUM").reason("Cần đối chiếu các báo cáo liên quan")
                .evidence("Nội dung ghi chú bằng chứng").status(status).createdAt(createdAt).build();
        entityManager.persist(flag);
        return flag;
    }

    private Report report(User user, String value) {
        Indicator indicator = Indicator.builder().type("URL").normalizedValue(value).createdAt(NOW).updatedAt(NOW).build();
        entityManager.persist(indicator);
        Report report = Report.builder().reporterUser(user).indicator(indicator).status("REJECTED")
                .reportCountSignal(1).coordinatedReportSuspected(false).moderationLocked(false)
                .createdAt(NOW).updatedAt(NOW).build();
        entityManager.persist(report);
        return report;
    }

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }
}
