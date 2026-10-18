package com.be.scamshield.serviceImpl;

import com.be.scamshield.dto.response.GuestLeaderboardResponse;
import com.be.scamshield.dto.response.LeaderboardStatCardResponse;
import com.be.scamshield.repository.GuestLeaderboardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuestLeaderboardServiceImplTest {

    @Mock
    private GuestLeaderboardRepository guestLeaderboardRepository;

    @Mock
    private Clock applicationClock;

    @InjectMocks
    private GuestLeaderboardServiceImpl service;

    private final LocalDateTime fixedNow = LocalDateTime.of(2025, 5, 16, 12, 0, 0);

    @BeforeEach
    void setUp() {
        lenient().when(applicationClock.getZone()).thenReturn(ZoneId.of("Asia/Ho_Chi_Minh"));
        lenient().when(applicationClock.instant()).thenReturn(fixedNow.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant());
    }

    @Test
    void getLeaderboardProducesCompleteResponseMatchingUiDesign() {
        when(guestLeaderboardRepository.countActiveUsers()).thenReturn(10L);
        when(guestLeaderboardRepository.countNewUsersSince(any(LocalDateTime.class))).thenReturn(50L);
        when(guestLeaderboardRepository.countNeutralizedThreats()).thenReturn(20L);

        GuestLeaderboardResponse response = service.getLeaderboard("THIS_MONTH");

        assertThat(response).isNotNull();

        // 1. Stats cards
        assertThat(response.getStats()).hasSize(4);
        LeaderboardStatCardResponse c1 = response.getStats().get(0);
        assertThat(c1.getKey()).isEqualTo("ACTIVE_EXPERTS");
        assertThat(c1.getLabel()).isEqualTo("CHUYÊN GIA KÍCH HOẠT");
        assertThat(c1.getValue()).isEqualTo("14,830"); // 14820 + 10
        assertThat(c1.getSub()).contains("chuyên gia tuần này");

        LeaderboardStatCardResponse c2 = response.getStats().get(1);
        assertThat(c2.getKey()).isEqualTo("THREATS_NEUTRALIZED");
        assertThat(c2.getLabel()).isEqualTo("MỐI ĐE DỌA VÔ HIỆU HÓA");
        assertThat(c2.getValue()).isEqualTo("84,930"); // 84910 + 20

        LeaderboardStatCardResponse c3 = response.getStats().get(2);
        assertThat(c3.getValue()).isEqualTo("99.4%");

        LeaderboardStatCardResponse c4 = response.getStats().get(3);
        assertThat(c4.getValue()).isEqualTo("4.2 phút");

        // 2. Podium Top 3
        assertThat(response.getTopThree()).isNotNull();
        assertThat(response.getTopThree().getRank1().getAnonymousIdentifier()).isEqualTo("Hunter_#1029");
        assertThat(response.getTopThree().getRank1().getBadge()).isEqualTo("HẠNG NHẤT TOÀN QUỐC");
        assertThat(response.getTopThree().getRank1().getFooterRight()).isEqualTo("#VN-01");

        assertThat(response.getTopThree().getRank2().getAnonymousIdentifier()).isEqualTo("Sentinel_#8842");
        assertThat(response.getTopThree().getRank2().getFooterRight()).isEqualTo("Top 0.05%");

        assertThat(response.getTopThree().getRank3().getAnonymousIdentifier()).isEqualTo("Member_#4912");
        assertThat(response.getTopThree().getRank3().getFooterRight()).isEqualTo("Top 0.1%");

        // 3. Table Rankings (Ranks 4-10)
        assertThat(response.getRankings()).hasSize(7);
        assertThat(response.getRankings().get(0).getRank()).isEqualTo("04");
        assertThat(response.getRankings().get(0).getName()).isEqualTo("Sentinel_#402");
        assertThat(response.getRankings().get(0).getRankClass()).isEqualTo("HỘ VỆ BẠCH KIM");
        assertThat(response.getRankings().get(0).getScore()).isEqualTo("1,215");

        assertThat(response.getRankings().get(6).getRank()).isEqualTo("10");
        assertThat(response.getRankings().get(6).getName()).isEqualTo("User_****64");

        // 4. Filter tabs
        assertThat(response.getFilters()).hasSize(3);
        assertThat(response.getActiveFilter()).isEqualTo("THIS_MONTH");
    }

    @Test
    void resolvesFilterCorrectlyForDifferentInputStrings() {
        assertThat(service.getLeaderboard("all").getActiveFilter()).isEqualTo("ALL_TIME");
        assertThat(service.getLeaderboard("Mọi lúc").getActiveFilter()).isEqualTo("ALL_TIME");
        assertThat(service.getLeaderboard("7 ngày qua").getActiveFilter()).isEqualTo("LAST_7_DAYS");
        assertThat(service.getLeaderboard("LAST_7_DAYS").getActiveFilter()).isEqualTo("LAST_7_DAYS");
        assertThat(service.getLeaderboard(null).getActiveFilter()).isEqualTo("THIS_MONTH");
    }
}
