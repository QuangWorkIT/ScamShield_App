package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.request.RegisterPartnerRequest;
import com.be.scamshield.dto.request.VerifyContactsRequest;
import com.be.scamshield.dto.response.ContactVerificationResponse;
import com.be.scamshield.dto.response.PartnerRegistrationResponse;
import com.be.scamshield.service.IPartnerRegistrationService;
import com.be.scamshield.serviceImpl.ContactVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/partners/registrations")
@RequiredArgsConstructor
@Tag(name = "Partner registration", description = "Nộp hồ sơ đăng ký đối tác doanh nghiệp")
public class PartnerRegistrationController {
    private final IPartnerRegistrationService registrationService;
    private final ContactVerificationService contactVerificationService;

    @PostMapping(value = "/verify-contacts", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Xác thực liên hệ (API tương thích)", deprecated = true,
            description = "Dùng /api/auth/verify-contacts cho cả cá nhân và Partner. API này gọi cùng dịch vụ, trả token dùng một lần, hạn 10 phút giờ Việt Nam (UTC+07:00).")
    public ResponseEntity<BaseResponse<ContactVerificationResponse>> verifyContacts(
            @Valid @org.springframework.web.bind.annotation.RequestBody VerifyContactsRequest request) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Email và điện thoại đã xác thực; có thể gửi hồ sơ",
                contactVerificationService.verifyContacts(request)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tạo tài khoản và nộp hồ sơ đối tác", description = "Cần verificationToken từ bước xác thực email và điện thoại trước. Part request là JSON có password; tài liệu PDF/JPG/PNG tối đa 25MB/tệp. Tạo tài khoản BUSINESS_PARTNER trạng thái INACTIVE và hồ sơ PENDING, chờ duyệt.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE))))
    public ResponseEntity<BaseResponse<PartnerRegistrationResponse>> register(
            @Valid @RequestPart("request") RegisterPartnerRequest request,
            @RequestPart(value = "businessLicenseFiles", required = false) List<MultipartFile> businessLicenseFiles,
            @RequestPart(value = "ownershipProofFiles", required = false) List<MultipartFile> ownershipProofFiles,
            @RequestPart(value = "authorizationFiles", required = false) List<MultipartFile> authorizationFiles) {
        PartnerRegistrationResponse response = registrationService.register(
                request, businessLicenseFiles, ownershipProofFiles, authorizationFiles);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BaseResponse<>(true, "Hồ sơ đối tác đã được gửi và đang chờ xét duyệt", response));
    }
}
