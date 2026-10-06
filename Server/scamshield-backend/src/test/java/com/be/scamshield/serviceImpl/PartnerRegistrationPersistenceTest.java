package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.PartnerVerificationStatus;
import com.be.scamshield.constant.OtpType;
import com.be.scamshield.constant.RoleEnum;
import com.be.scamshield.constant.UserStatus;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.entity.PartnerProfile;
import com.be.scamshield.entity.OtpVerification;
import com.be.scamshield.dto.request.RegisterPartnerRequest;
import com.be.scamshield.dto.request.VerifyContactsRequest;
import com.be.scamshield.repository.ContactVerificationRepository;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.dto.response.PartnerRegistrationResponse;
import com.be.scamshield.repository.PartnerDocumentRepository;
import com.be.scamshield.repository.PartnerProfileRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.repository.RoleRepository;
import com.be.scamshield.repository.OtpVerificationRepository;
import com.be.scamshield.exception.RegistrationConflictException;
import com.be.scamshield.exception.SmsProviderException;
import com.be.scamshield.service.IPartnerRegistrationService;
import com.be.scamshield.service.IAuthService;
import com.be.scamshield.service.IUserAlertSubscriptionService;
import com.be.scamshield.dto.request.RegisterPersonalRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;

@SpringBootTest(useMainMethod = SpringBootTest.UseMainMethod.ALWAYS)
@ActiveProfiles("test")
class PartnerRegistrationPersistenceTest {
    @Autowired
    private IPartnerRegistrationService service;
    @Autowired
    private ContactVerificationService contactVerificationService;
    @Autowired
    private IAuthService authService;
    @MockitoSpyBean
    private IUserAlertSubscriptionService subscriptionService;
    @Autowired
    private PartnerProfileRepository profileRepository;
    @MockitoSpyBean
    private PartnerDocumentRepository documentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TransactionTemplate transactionTemplate;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private OtpVerificationRepository otpRepository;
    @Autowired
    private Clock applicationClock;
    @MockitoSpyBean
    private ContactVerificationRepository verificationRepository;
    @MockitoBean
    private FirebasePhoneClient firebasePhoneClient;
    private RegisterPartnerRequest request;
    private List<MultipartFile> files;

    @BeforeEach
    void setUp() {
        documentRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();
        otpRepository.deleteAll();
        verificationRepository.deleteAll();
        LocalDateTime now = LocalDateTime.now(applicationClock);
        otpRepository.saveAndFlush(OtpVerification.builder().target("0912345678").type(OtpType.PHONE)
                .provider("FIREBASE").providerSessionInfo("test-session").createdAt(now)
                .expiresAt(now.plusMinutes(5)).isVerified(false).failedAttempts(0).build());
        LocalDateTime emailNow = LocalDateTime.now(applicationClock);
        otpRepository.saveAndFlush(OtpVerification.builder().target("contact@example.com.vn").type(OtpType.EMAIL)
                .otpCode("654321").createdAt(emailNow).expiresAt(emailNow.plusMinutes(5))
                .isVerified(false).failedAttempts(0).build());
        if (roleRepository.findByName(RoleEnum.BUSINESS_PARTNER.name()).isEmpty()) {
            roleRepository.saveAndFlush(Role.builder().name(RoleEnum.BUSINESS_PARTNER.name()).build());
        }
        if (roleRepository.findByName(RoleEnum.REGISTERED_USER.name()).isEmpty()) {
            roleRepository.saveAndFlush(Role.builder().name(RoleEnum.REGISTERED_USER.name()).build());
        }
        request = new RegisterPartnerRequest();
        request.setLegalName("Công ty Example");
        request.setTaxCode("0100112437");
        request.setCorporateEmail("contact@example.com.vn");
        request.setPassword("Example123!");
        request.setRepresentativeNameAndTitle("Huy - Giám đốc");
        request.setContactPhone("0912345678");
        request.setOfficialDomains(List.of("example.com.vn", "app.example.com.vn"));
        request.setOfficialHotlines(List.of("1900545413"));
        request.setSmsBrandNames(List.of("EXAMPLE"));
        request.setLegalRepresentative(true);
        request.setAgreeTerms(true);
        files = List.of(new MockMultipartFile("file", "proof.pdf", "application/pdf",
                "%PDF-1.7\nproof".getBytes(StandardCharsets.US_ASCII)));
    }

    @Test
    void commitsLinkedAccountWithBcryptAndPendingApplicationWithoutWhitelist() {
        prepareVerification();
        long usersBefore = userRepository.count();
        PartnerRegistrationResponse response = service.register(request, files, files, null);
        assertThat(profileRepository.findById(response.getRegistrationId())).isPresent();
        assertThat(documentRepository.count()).isEqualTo(2);
        assertThat(jdbc.queryForObject("select count(*) from partner_profile_domains", Long.class)).isEqualTo(2);
        byte[] stored = jdbc.queryForObject("select content from partner_documents where document_type = 'BUSINESS_LICENSE'", byte[].class);
        assertThat(stored).isEqualTo("%PDF-1.7\nproof".getBytes(StandardCharsets.US_ASCII));
        assertThat(userRepository.count()).isEqualTo(usersBefore + 1);
        transactionTemplate.executeWithoutResult(status -> {
            User user = userRepository.findById(response.getUserId()).orElseThrow();
            assertThat(user.getEmail()).isEqualTo("contact@example.com.vn");
            assertThat(user.getPhoneNumber()).isEqualTo("0912345678");
            assertThat(user.getRole().getName()).isEqualTo(RoleEnum.BUSINESS_PARTNER.name());
            assertThat(user.getStatus()).isEqualTo(UserStatus.INACTIVE.name());
            assertThat(user.getPasswordHash()).isNotEqualTo(request.getPassword());
            assertThat(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).isTrue();
            assertThat(profileRepository.findById(response.getRegistrationId()).orElseThrow().getUser().getId())
                    .isEqualTo(user.getId());
            PartnerProfile profile = profileRepository.findById(response.getRegistrationId()).orElseThrow();
            assertThat(profile.getTaxCode()).isEqualTo("0100112437");
            assertThat(profile.getBrandName()).isEqualTo(request.getLegalName());
            assertThat(profile.getPartnerType()).isEqualTo("BUSINESS");
            assertThat(profile.getVerificationStatus()).isEqualTo(PartnerVerificationStatus.PENDING);
            assertThat(profile.getVerifiedAt()).isNull();
            assertThat(profile.getOfficialDomains()).containsExactlyInAnyOrder("example.com.vn", "app.example.com.vn");
            assertThat(documentRepository.findAll()).allSatisfy(document ->
                    assertThat(document.getPartner().getId()).isEqualTo(profile.getId()));
        });
        assertThat(jdbc.queryForObject("select count(*) from whitelist_entries", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select is_verified from otp_verifications where type='EMAIL'", Boolean.class)).isTrue();
    }

    @Test
    void existingApprovedProfileCanStillBeStoredWithoutNewDossierFields() {
        LocalDateTime now = LocalDateTime.now(applicationClock);
        User user = userRepository.saveAndFlush(User.builder().fullName("Legacy partner")
                .phoneNumber("0912345679").email("legacy@example.com").passwordHash("existing-hash")
                .status(UserStatus.ACTIVE.name()).reputationPoints(0).createdAt(now).updatedAt(now).build());
        PartnerProfile profile = profileRepository.saveAndFlush(PartnerProfile.builder().user(user)
                .legalName("Existing company").brandName("Existing brand").partnerType("BUSINESS")
                .verificationStatus(PartnerVerificationStatus.VERIFIED).verifiedAt(now).createdAt(now).build());
        PartnerProfile stored = profileRepository.findById(profile.getId()).orElseThrow();
        assertThat(stored.getVerificationStatus()).isEqualTo(PartnerVerificationStatus.VERIFIED);
        assertThat(stored.getBrandName()).isEqualTo("Existing brand");
        assertThat(stored.getTaxCode()).isNull();
        assertThat(stored.getVerifiedAt()).isNotNull();
    }

    @Test
    void wrongEmailOtpPersistsFailedAttemptsWithoutConsumingSmsOrCreatingAccount() {
        VerifyContactsRequest contacts = contacts();
        contacts.setEmailOtp("000000");
        for (int attempt = 0; attempt < 6; attempt++) {
            assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThat(jdbc.queryForObject("select failed_attempts from otp_verifications where type='EMAIL'", Integer.class)).isEqualTo(5);
        assertThat(jdbc.queryForObject("select is_verified from otp_verifications where type='PHONE'", Boolean.class)).isFalse();
        assertThat(userRepository.count()).isZero();
        assertThat(profileRepository.count()).isZero();
        verifyNoInteractions(firebasePhoneClient);
    }

    @ParameterizedTest
    @ValueSource(strings = {"expired", "consumed"})
    void rejectsExpiredOrConsumedEmailOtp(String state) {
        if (state.equals("expired")) {
            jdbc.update("update otp_verifications set expires_at=? where type='EMAIL'", LocalDateTime.now(applicationClock).minusMinutes(1));
        } else {
            jdbc.update("update otp_verifications set is_verified=true where type='EMAIL'");
        }
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(userRepository.count()).isZero();
        assertThat(profileRepository.count()).isZero();
        verifyNoInteractions(firebasePhoneClient);
    }

    @Test
    void evidencePersistenceFailureRollsBackApplicationAndAllLists() {
        prepareVerification();
        doThrow(new IllegalStateException("evidence storage failed")).when(documentRepository).saveAll(any());
        assertThatThrownBy(() -> service.register(request, files, files, null)).isInstanceOf(IllegalStateException.class);
        assertThat(profileRepository.count()).isZero();
        assertThat(documentRepository.count()).isZero();
        assertThat(userRepository.count()).isZero();
        assertThat(jdbc.queryForObject("select count(*) from partner_profile_domains", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from partner_profile_hotlines", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from partner_profile_brand_names", Long.class)).isZero();
        assertThat(verificationRepository.findAll().getFirst().getUsedAt()).isNull();
    }

    @Test
    void duplicateAccountEmailDoesNotLeaveAnotherAccountOrApplication() {
        prepareVerification();
        service.register(request, files, files, null);
        request.setTaxCode("0100112438");
        request.setContactPhone("0912345679");
        request.setCorporateEmail("CONTACT@EXAMPLE.COM.VN");
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(RegistrationConflictException.class).hasMessageContaining("Email");
        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(profileRepository.count()).isEqualTo(1);
        assertThat(documentRepository.count()).isEqualTo(2);
    }

    @Test
    void incorrectSmsOtpPersistsAttemptAndPreventsRegistration() {
        doThrow(new IllegalArgumentException("invalid OTP")).when(firebasePhoneClient)
                .verify("test-session", "123456", "+84912345678");
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(userRepository.count()).isZero();
        assertThat(profileRepository.count()).isZero();
        assertThat(otpRepository.findAll().getFirst().getFailedAttempts()).isEqualTo(1);
        assertThat(otpRepository.findAll().getFirst().isVerified()).isFalse();
        assertThat(verificationRepository.count()).isZero();
        assertThat(jdbc.queryForObject("select is_verified from otp_verifications where type='EMAIL'", Boolean.class)).isFalse();
    }

    @Test
    void wrongSmsDoesNotConsumeEmailAndRetryWithTheSameEmailCodeVerifiesBoth() {
        VerifyContactsRequest contacts = contacts();
        contacts.setPhoneOtp("000000");
        doThrow(new IllegalArgumentException("invalid OTP")).when(firebasePhoneClient)
                .verify("test-session", "000000", "+84912345678");
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts))
                .isInstanceOf(IllegalArgumentException.class).hasMessageStartingWith("OTP điện thoại không hợp lệ:");
        assertThat(jdbc.queryForObject("select count(*) from otp_verifications where is_verified=true", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select failed_attempts from otp_verifications where type='PHONE'", Integer.class)).isEqualTo(1);
        assertThat(verificationRepository.count()).isZero();

        contacts.setPhoneOtp("123456");
        assertThat(contactVerificationService.verifyContacts(contacts).getVerificationToken()).hasSize(43);
        assertThat(jdbc.queryForObject("select count(*) from otp_verifications where is_verified=true", Long.class)).isEqualTo(2);
        assertThat(verificationRepository.count()).isEqualTo(1);
    }

    @Test
    void providerOutageDoesNotConsumeEitherOtpOrCountAsAnIncorrectAttempt() {
        doThrow(new SmsProviderException("provider unavailable")).when(firebasePhoneClient)
                .verify("test-session", "123456", "+84912345678");
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(SmsProviderException.class);
        assertThat(jdbc.queryForObject("select count(*) from otp_verifications where is_verified=true", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select sum(failed_attempts) from otp_verifications", Long.class)).isZero();
        assertThat(verificationRepository.count()).isZero();
    }

    @Test
    void failureToStoreContactProofRollsBackBothVerifiedFlags() {
        doThrow(new IllegalStateException("proof storage failed")).when(verificationRepository).saveAndFlush(any());
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("select count(*) from otp_verifications where is_verified=true", Long.class)).isZero();
        assertThat(jdbc.queryForObject("select provider_session_info from otp_verifications where type='PHONE'", String.class))
                .isEqualTo("test-session");
        assertThat(verificationRepository.count()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"expired", "used", "email", "phone", "unknown"})
    void cannotSubmitFormWithExpiredUsedUnboundOrUnknownVerification(String state) {
        prepareVerification();
        switch (state) {
            case "expired" -> jdbc.update("update contact_verifications set expires_at=?", LocalDateTime.now(applicationClock).minusMinutes(1));
            case "used" -> jdbc.update("update contact_verifications set used_at=?", LocalDateTime.now(applicationClock));
            case "email" -> request.setCorporateEmail("another@gmail.com");
            case "phone" -> request.setContactPhone("0912345679");
            case "unknown" -> request.setVerificationToken("x".repeat(43));
            default -> throw new IllegalStateException();
        }
        assertThatThrownBy(() -> service.register(request, files, files, null)).isInstanceOf(BadRequestException.class);
        assertThat(userRepository.count()).isZero();
        assertThat(profileRepository.count()).isZero();
    }

    @Test
    void verificationAloneDoesNotCreateAccountAndSubmissionConsumesToken() {
        prepareVerification();
        assertThat(userRepository.count()).isZero();
        assertThat(profileRepository.count()).isZero();
        service.register(request, files, files, null);
        assertThat(verificationRepository.findAll().getFirst().getUsedAt()).isNotNull();
    }

    private void prepareVerification() {
        request.setVerificationToken(contactVerificationService.verifyContacts(contacts()).getVerificationToken());
    }

    @Test
    void sharedContactProofCreatesPersonalAccountWithoutPartnerProfile() {
        prepareVerification();
        RegisterPersonalRequest personal = personal();
        personal.setEmail("CONTACT@EXAMPLE.COM.VN");
        authService.registerPersonal(personal);
        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(profileRepository.count()).isZero();
        assertThat(documentRepository.count()).isZero();
        transactionTemplate.executeWithoutResult(status -> {
            User user = userRepository.findAll().getFirst();
            assertThat(user.getEmail()).isEqualTo("contact@example.com.vn");
            assertThat(user.getPhoneNumber()).isEqualTo("0912345678");
            assertThat(user.getRole().getName()).isEqualTo(RoleEnum.REGISTERED_USER.name());
            assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE.name());
            assertThat(passwordEncoder.matches(personal.getPassword(), user.getPasswordHash())).isTrue();
        });
        assertThat(verificationRepository.findAll().getFirst().getUsedAt()).isNotNull();
        assertThatThrownBy(() -> transactionTemplate.executeWithoutResult(status ->
                contactVerificationService.consume(personal.getVerificationToken(), "contact@example.com.vn", "0912345678")))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("đã dùng");
    }

    @Test
    void applicationClockAndStoredOtpTimesUseVietnamTime() {
        assertThat(applicationClock.getZone().getId()).isEqualTo("Asia/Ho_Chi_Minh");
        LocalDateTime storedPhone = jdbc.queryForObject(
                "select created_at from otp_verifications where type='PHONE'", LocalDateTime.class);
        LocalDateTime storedEmail = jdbc.queryForObject(
                "select created_at from otp_verifications where type='EMAIL'", LocalDateTime.class);
        assertThat(storedPhone).isCloseTo(storedEmail, within(1, ChronoUnit.SECONDS));
        assertThat(storedPhone.atZone(applicationClock.getZone()).toInstant())
                .isCloseTo(applicationClock.instant(), within(10, ChronoUnit.SECONDS));
    }

    @ParameterizedTest
    @ValueSource(strings = {"missing", "unknown", "expired", "used", "email", "phone"})
    void personalRegistrationRequiresUnusedProofForTheSameContacts(String state) {
        prepareVerification();
        RegisterPersonalRequest personal = personal();
        switch (state) {
            case "missing" -> personal.setVerificationToken(null);
            case "unknown" -> personal.setVerificationToken("x".repeat(43));
            case "expired" -> jdbc.update("update contact_verifications set expires_at=?", LocalDateTime.now(applicationClock).minusMinutes(1));
            case "used" -> jdbc.update("update contact_verifications set used_at=?", LocalDateTime.now(applicationClock));
            case "email" -> personal.setEmail("other@gmail.com");
            case "phone" -> personal.setPhoneNumber("0912345679");
            default -> throw new IllegalStateException();
        }
        assertThatThrownBy(() -> authService.registerPersonal(personal)).isInstanceOf(BadRequestException.class);
        assertThat(userRepository.count()).isZero();
    }

    @Test
    void personalRegistrationFailureRollsBackAccountAndProofSoSubmissionCanRetry() {
        prepareVerification();
        RegisterPersonalRequest personal = personal();
        personal.setReceiveAlerts(true);
        doThrow(new IllegalStateException("subscription failed")).when(subscriptionService).subscribeAllCategories(any());
        assertThatThrownBy(() -> authService.registerPersonal(personal)).isInstanceOf(IllegalStateException.class);
        assertThat(userRepository.count()).isZero();
        assertThat(verificationRepository.findAll().getFirst().getUsedAt()).isNull();
        personal.setReceiveAlerts(false);
        authService.registerPersonal(personal);
        assertThat(userRepository.count()).isEqualTo(1);
    }

    private RegisterPersonalRequest personal() {
        RegisterPersonalRequest personal = new RegisterPersonalRequest();
        personal.setFullName("Nguyễn Văn An");
        personal.setEmail(request.getCorporateEmail());
        personal.setPhoneNumber(request.getContactPhone());
        personal.setPassword("Example123!");
        personal.setAgreeTerms(true);
        personal.setVerificationToken(request.getVerificationToken());
        return personal;
    }

    @Test
    void parallelPersonalAndPartnerRegistrationCannotConsumeTheSameProofTwice() throws Exception {
        prepareVerification();
        RegisterPersonalRequest personal = personal();
        try (var executor = Executors.newFixedThreadPool(2)) {
            var personalResult = executor.submit(() -> {
                try {
                    authService.registerPersonal(personal);
                    return true;
                } catch (BadRequestException | RegistrationConflictException ex) {
                    return false;
                }
            });
            var partnerResult = executor.submit(() -> {
                try {
                    service.register(request, files, files, null);
                    return true;
                } catch (BadRequestException | RegistrationConflictException ex) {
                    return false;
                }
            });
            assertThat((personalResult.get() ? 1 : 0) + (partnerResult.get() ? 1 : 0)).isEqualTo(1);
        }
        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(verificationRepository.findAll().getFirst().getUsedAt()).isNotNull();
    }

    private VerifyContactsRequest contacts() {
        VerifyContactsRequest contacts = new VerifyContactsRequest();
        contacts.setEmail(request.getCorporateEmail());
        contacts.setPhoneNumber(request.getContactPhone());
        contacts.setEmailOtp("654321");
        contacts.setPhoneOtp("123456");
        return contacts;
    }
}
