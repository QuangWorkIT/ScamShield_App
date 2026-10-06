package com.be.scamshield.serviceImpl;

import com.be.scamshield.constant.PartnerVerificationStatus;
import com.be.scamshield.constant.OtpType;
import com.be.scamshield.constant.RoleEnum;
import com.be.scamshield.constant.UserStatus;
import com.be.scamshield.dto.request.RegisterPartnerRequest;
import com.be.scamshield.dto.request.VerifyContactsRequest;
import com.be.scamshield.entity.ContactVerification;
import com.be.scamshield.repository.ContactVerificationRepository;
import java.time.Clock;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.util.Locale;
import org.mockito.Spy;
import com.be.scamshield.dto.response.PartnerRegistrationResponse;
import com.be.scamshield.entity.PartnerProfile;
import com.be.scamshield.entity.PartnerDocument;
import com.be.scamshield.entity.Role;
import com.be.scamshield.entity.User;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.RegistrationConflictException;
import com.be.scamshield.repository.PartnerDocumentRepository;
import com.be.scamshield.repository.PartnerProfileRepository;
import com.be.scamshield.repository.RoleRepository;
import com.be.scamshield.repository.UserRepository;
import com.be.scamshield.service.IOtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PartnerRegistrationServiceImplTest {
    @Mock
    private PartnerProfileRepository profileRepository;
    @Mock
    private PartnerDocumentRepository documentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private IOtpService otpService;
    @Mock
    private ContactVerificationRepository verificationRepository;
    @Spy
    private Clock applicationClock = Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"));
    private PartnerRegistrationServiceImpl service;
    private ContactVerificationService contactVerificationService;
    @Captor
    private ArgumentCaptor<Iterable<PartnerDocument>> documents;
    private RegisterPartnerRequest request;
    private List<MultipartFile> files;

    @BeforeEach
    void setUp() {
        contactVerificationService = new ContactVerificationService(userRepository, otpService, verificationRepository, applicationClock);
        service = new PartnerRegistrationServiceImpl(applicationClock, profileRepository, documentRepository, userRepository,
                roleRepository, passwordEncoder, contactVerificationService);
        request = new RegisterPartnerRequest();
        request.setLegalName(" Công ty Example ");
        request.setTaxCode("0100112437");
        request.setCorporateEmail("CONTACT@EXAMPLE.COM.VN");
        request.setPassword("Example123!");
        request.setVerificationToken("x".repeat(43));

        request.setRepresentativeNameAndTitle(" Trần Quốc Huy - Giám đốc ");
        request.setContactPhone("+84 912 345 678");
        request.setOfficialDomains(List.of("Example.com.vn", "example.com.vn", "app.example.com.vn"));
        request.setOfficialHotlines(List.of("1900 545413", "1900545413"));
        request.setSmsBrandNames(List.of("Example", "EXAMPLE"));
        request.setLegalRepresentative(true);
        request.setAgreeTerms(true);
        files = List.of(new MockMultipartFile("file", "proof.pdf", "application/pdf",
                "%PDF-1.7\nproof".getBytes(StandardCharsets.US_ASCII)));
    }

    @Test
    void savesPendingApplicationAndCategorizedPrivateEvidence() {
        prepareAccountPersistence();
        when(profileRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            PartnerProfile registration = invocation.getArgument(0);
            registration.setId(42L);
            return registration;
        });
        PartnerRegistrationResponse response = service.register(request, files, files, null);
        assertThat(response.getRegistrationId()).isEqualTo(42L);
        assertThat(response.getUserId()).isEqualTo(7L);
        assertThat(response.getVerificationStatus()).isEqualTo(PartnerVerificationStatus.PENDING);
        ArgumentCaptor<PartnerProfile> registration = ArgumentCaptor.forClass(PartnerProfile.class);
        verify(profileRepository).saveAndFlush(registration.capture());
        assertThat(registration.getValue().getLegalName()).isEqualTo("Công ty Example");
        assertThat(registration.getValue().getCorporateEmail()).isEqualTo("contact@example.com.vn");
        assertThat(registration.getValue().getContactPhone()).isEqualTo("0912345678");
        assertThat(registration.getValue().getOfficialDomains()).containsExactly("example.com.vn", "app.example.com.vn");
        assertThat(registration.getValue().getOfficialHotlines()).containsExactly("1900545413");
        assertThat(registration.getValue().getSmsBrandNames()).containsExactly("EXAMPLE");
        assertThat(registration.getValue().getUser().getId()).isEqualTo(7L);
        assertThat(registration.getValue().getUser().getPasswordHash()).isEqualTo("encoded-password");
        assertThat(registration.getValue().getUser().getStatus()).isEqualTo(UserStatus.INACTIVE.name());
        assertThat(registration.getValue().getUser().getRole().getName()).isEqualTo(RoleEnum.BUSINESS_PARTNER.name());
        verify(passwordEncoder).encode("Example123!");
        verifyNoInteractions(otpService);

        verify(documentRepository).saveAll(documents.capture());
        assertThat(documents.getValue()).extracting(PartnerDocument::getDocumentType)
                .containsExactly("BUSINESS_LICENSE", "OWNERSHIP_PROOF");
        assertThat(documents.getValue()).allSatisfy(document -> {
            assertThat(document.getPartner()).isSameAs(registration.getValue());
            assertThat(document.getContent()).startsWith("%PDF-".getBytes(StandardCharsets.US_ASCII));
        });
    }

    @Test
    void delegatedApplicantRequiresAuthorization() {
        request.setLegalRepresentative(false);
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("ủy quyền");
        assertNoWrites();
    }

    @Test
    void delegatedApplicantCanSubmitAllThreeDocumentCategories() {
        prepareAccountPersistence();
        request.setLegalRepresentative(false);
        service.register(request, files, files, files);
        verify(documentRepository).saveAll(documents.capture());
        assertThat(documents.getValue()).extracting(PartnerDocument::getDocumentType)
                .containsExactly("BUSINESS_LICENSE", "OWNERSHIP_PROOF", "AUTHORIZATION");
    }

    @Test
    void requiresBothBusinessLicenseAndOwnershipProof() {
        assertThatThrownBy(() -> service.register(request, null, files, null)).isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.register(request, files, List.of(), null)).isInstanceOf(BadRequestException.class);
        assertNoWrites();
    }

    @ParameterizedTest
    @ValueSource(strings = {"contact@gmail.com", "contact@outlook.com", "contact@yahoo.com", "contact@unrelated.vn"})
    void acceptsPersonalAndUnrelatedCorporateEmail(String email) {
        request.setCorporateEmail(email);
        prepareAccountPersistence();
        when(profileRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        service.register(request, files, files, null);
        ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(user.capture());
        assertThat(user.getValue().getEmail()).isEqualTo(email);
        ArgumentCaptor<PartnerProfile> registration = ArgumentCaptor.forClass(PartnerProfile.class);
        verify(profileRepository).saveAndFlush(registration.capture());
        assertThat(registration.getValue().getCorporateEmail()).isEqualTo(email);
        assertThat(registration.getValue().getOfficialDomains()).contains("example.com.vn");
    }

    @ParameterizedTest
    @ValueSource(strings = {"https://example.com.vn", "example.com.vn/path", "127.0.0.1", "example..com.vn"})
    void rejectsUrlsAndInvalidHostnames(String domain) {
        request.setOfficialDomains(List.of(domain));
        assertThatThrownBy(() -> service.register(request, files, files, null)).isInstanceOf(BadRequestException.class);
        assertNoWrites();
    }

    @Test
    void normalizesTaxCodeBeforeDuplicateCheck() {
        request.setTaxCode("0100112437-001");
        when(profileRepository.existsByTaxCode("0100112437001")).thenReturn(true);
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(RegistrationConflictException.class);
        assertNoWrites();
    }

    @Test
    void concurrentDuplicateReturnsConflictAndDoesNotSaveEvidence() {
        prepareAccountPersistence();
        doThrow(new DataIntegrityViolationException("duplicate tax code", new SQLException("duplicate", "23505")))
                .when(profileRepository).saveAndFlush(any());
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(RegistrationConflictException.class);
        verifyNoInteractions(documentRepository);
    }

    @Test
    void rejectsDisguisedFileBeforeSavingRegistration() {
        List<MultipartFile> disguised = List.of(new MockMultipartFile("file", "proof.pdf", "application/pdf",
                "<script>alert(1)</script>".getBytes(StandardCharsets.US_ASCII)));
        assertThatThrownBy(() -> service.register(request, files, disguised, null)).isInstanceOf(BadRequestException.class);
        assertNoWrites();
    }

    @Test
    void rejectsEmptyAndOversizedFiles() {
        MultipartFile oversized = mock(MultipartFile.class);
        when(oversized.getSize()).thenReturn(25L * 1024 * 1024 + 1);
        assertThatThrownBy(() -> service.register(request, files, List.of(oversized), null))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("25MB");
        List<MultipartFile> empty = List.of(new MockMultipartFile("file", "proof.pdf", "application/pdf", new byte[0]));
        assertThatThrownBy(() -> service.register(request, empty, files, null)).isInstanceOf(BadRequestException.class);
        assertNoWrites();
    }

    @Test
    void rejectsInternationalPhoneThatBecomesTooShortAfterNormalization() {
        request.setContactPhone("+84 1234567");
        assertThatThrownBy(() -> service.register(request, files, files, null)).isInstanceOf(BadRequestException.class);
        assertNoWrites();
    }

    @Test
    void rejectsExcessiveFileCountAndTotalBytesBeforeReadingFiles() {
        List<MultipartFile> tooMany = Collections.nCopies(10, files.getFirst());
        assertThatThrownBy(() -> service.register(request, tooMany, files, null))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("10 tệp");
        MultipartFile large = mock(MultipartFile.class);
        when(large.getSize()).thenReturn(25L * 1024 * 1024);
        assertThatThrownBy(() -> service.register(request, List.of(large, large), List.of(large, large), null))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("75MB");
        assertNoWrites();
    }

    @Test
    void requiresConsentBeforeAnyPersistence() {
        request.setAgreeTerms(false);
        assertThatThrownBy(() -> service.register(request, files, files, null)).isInstanceOf(BadRequestException.class);
        verifyNoInteractions(profileRepository, documentRepository, userRepository, passwordEncoder);
    }

    @Test
    void rejectsExistingEmailIgnoringCaseBeforeCreatingAccount() {
        when(userRepository.existsByEmailIgnoreCase("contact@example.com.vn")).thenReturn(true);
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(RegistrationConflictException.class).hasMessageContaining("Email");
        assertNoWrites();
    }

    @Test
    void rejectsExistingNormalizedPhoneBeforeCreatingAccount() {
        when(userRepository.findByPhoneNumber("0912345678")).thenReturn(Optional.of(new User()));
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(RegistrationConflictException.class).hasMessageContaining("Số điện thoại");
        assertNoWrites();
    }

    @Test
    void rejectsPasswordExceedingBcryptByteLimitBeforeCreatingAccount() {
        request.setPassword("ậ".repeat(25));
        assertThatThrownBy(() -> service.register(request, files, files, null))
                .isInstanceOf(BadRequestException.class).hasMessageContaining("72 byte");
        assertNoWrites();
    }

    @Test
    void invalidEmailOtpPreventsSmsVerificationAndAccountCreation() {
        
        when(otpService.verifyContactOtps("contact@example.com.vn", "654321", "0912345678", "123456"))
                .thenThrow(new IllegalArgumentException("OTP email không hợp lệ: mã không đúng"));
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageStartingWith("OTP email không hợp lệ:");
        assertNoWrites();
        verify(otpService, never()).verifyOtp("0912345678", "123456", OtpType.PHONE);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void invalidSmsOtpPreventsAccountAndApplicationCreation() {
        
        when(otpService.verifyContactOtps("contact@example.com.vn", "654321", "0912345678", "123456"))
                .thenThrow(new IllegalArgumentException("OTP điện thoại không hợp lệ: mã không đúng"));
        assertThatThrownBy(() -> contactVerificationService.verifyContacts(contacts()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageStartingWith("OTP điện thoại không hợp lệ:");
        assertNoWrites();
        verifyNoInteractions(passwordEncoder);
    }

    private VerifyContactsRequest contacts() {
        VerifyContactsRequest contacts = new VerifyContactsRequest();
        contacts.setEmail(request.getCorporateEmail());
        contacts.setPhoneNumber(request.getContactPhone());
        contacts.setEmailOtp("654321");
        contacts.setPhoneOtp("123456");
        return contacts;
    }

    @Test
    void verifiesContactsAndIssuesBoundTokenWithoutCreatingAccount() {
        when(otpService.verifyContactOtps(any(), any(), any(), any())).thenReturn(true);
        var response = contactVerificationService.verifyContacts(contacts());
        assertThat(response.getVerificationToken()).matches("[A-Za-z0-9_-]{43}");
        ArgumentCaptor<ContactVerification> grant = ArgumentCaptor.forClass(ContactVerification.class);
        verify(verificationRepository).saveAndFlush(grant.capture());
        assertThat(grant.getValue().getTokenHash()).hasSize(64).isNotEqualTo(response.getVerificationToken());
        assertThat(grant.getValue().getEmail()).isEqualTo("contact@example.com.vn");
        assertThat(grant.getValue().getPhoneNumber()).isEqualTo("0912345678");
        verify(otpService).verifyContactOtps("contact@example.com.vn", "654321", "0912345678", "123456");
        assertNoWrites();
    }
    private void prepareAccountPersistence() {
        ContactVerification grant = ContactVerification.builder()
                .email(request.getCorporateEmail().trim().toLowerCase(Locale.ROOT)).phoneNumber("0912345678")
                .expiresAt(LocalDateTime.now(applicationClock).plusMinutes(10)).build();
        when(verificationRepository.findLockedByTokenHash(any())).thenReturn(Optional.of(grant));
        when(roleRepository.findByName(RoleEnum.BUSINESS_PARTNER.name()))
                .thenReturn(Optional.of(Role.builder().name(RoleEnum.BUSINESS_PARTNER.name()).build()));
        when(passwordEncoder.encode("Example123!")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(7L);
            return user;
        });
    }

    private void assertNoWrites() {
        verify(userRepository, never()).saveAndFlush(any());
        verify(profileRepository, never()).saveAndFlush(any());
        verifyNoInteractions(documentRepository);
    }
}
