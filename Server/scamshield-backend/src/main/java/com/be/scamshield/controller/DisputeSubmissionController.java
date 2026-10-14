package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.SaveDisputeDraftRequest;
import com.be.scamshield.dto.request.SubmitDisputeRequest;
import com.be.scamshield.dto.response.DisputeFormResponse;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.exception.UnauthorizedException;
import com.be.scamshield.security.UserPrincipal;
import com.be.scamshield.service.IDisputeSubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Disputes", description = "Hồ sơ khiếu nại của người dùng đang đăng nhập")
public class DisputeSubmissionController {

    private final IDisputeSubmissionService submissionService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Gửi hồ sơ khiếu nại", description = "Người gửi được lấy từ JWT. "
            + "Part request là JSON gồm loại và giá trị chỉ số, quan hệ pháp lý, lý do và agreeTerms=true. "
            + "Backend tìm xác thực blacklist còn ACTIVE; không nhận khiếu nại cho nhãn đã RETRACTED. "
            + "Cần ít nhất một tệp PDF/JPG/PNG, tối đa 5MB/tệp và 10 tệp/hồ sơ. "
            + "Hồ sơ mới có trạng thái PENDING, bằng chứng chờ kiểm tra. Không truyền removedEvidenceIds khi tạo mới.",
            requestBody = @RequestBody(required = true, content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = SubmitMultipartRequest.class),
                    encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE))))
    public ResponseEntity<BaseResponse<DisputeFormResponse>> submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestPart("request") String request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        Long userId = requireUserId(principal);
        DisputeFormResponse response = submissionService.submit(
                userId, parseRequest(request, SubmitDisputeRequest.class), files);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BaseResponse<>(true, "Hồ sơ khiếu nại đã được gửi và đang chờ thẩm định", response));
    }

    @PostMapping(value = "/drafts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tạo bản nháp khiếu nại", description = "Các trường nội dung và tệp có thể bỏ trống. "
            + "Chưa cần cam kết hoặc tìm thấy xác thực blacklist. Tệp PDF/JPG/PNG tối đa 5MB/tệp, 10 tệp/hồ sơ. "
            + "Bản nháp thuộc người dùng trong JWT và chưa được tính vào danh sách/thống kê hồ sơ đã nộp. "
            + "Không truyền removedEvidenceIds khi tạo mới.",
            requestBody = @RequestBody(required = true, content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = DraftMultipartRequest.class),
                    encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE))))
    public ResponseEntity<BaseResponse<DisputeFormResponse>> createDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestPart("request") String request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        Long userId = requireUserId(principal);
        DisputeFormResponse response = submissionService.createDraft(
                userId, parseRequest(request, SaveDisputeDraftRequest.class), files);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BaseResponse<>(true, "Đã lưu bản nháp khiếu nại", response));
    }

    @PutMapping(value = "/drafts/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật bản nháp khiếu nại", description = "Chỉ sửa bản nháp của người dùng trong JWT. "
            + "Mỗi lần lưu thay thế toàn bộ trường nội dung: trường bỏ trống được xóa. "
            + "Tệp mới được thêm vào các tệp đã lưu; removedEvidenceIds là các ID tệp muốn xóa khỏi chính bản nháp này. "
            + "Tổng tệp còn lại tối đa 10, mỗi tệp mới là PDF/JPG/PNG tối đa 5MB.",
            requestBody = @RequestBody(required = true, content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = DraftMultipartRequest.class),
                    encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE))))
    public ResponseEntity<BaseResponse<DisputeFormResponse>> updateDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestPart("request") String request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        Long userId = requireUserId(principal);
        DisputeFormResponse response = submissionService.updateDraft(
                userId, requirePositiveId(id), parseRequest(request, SaveDisputeDraftRequest.class), files);
        return ResponseEntity.ok(new BaseResponse<>(true, "Đã cập nhật bản nháp khiếu nại", response));
    }

    @GetMapping("/drafts")
    @Operation(summary = "Lấy danh sách bản nháp khiếu nại của tôi", description = "Chỉ lấy bản nháp DRAFT "
            + "thuộc người dùng trong JWT. Mặc định trang 0, 10 bản nháp; sắp xếp theo lần cập nhật mới nhất. "
            + "Các thời điểm là giờ Việt Nam.")
    public ResponseEntity<BaseResponse<PaginatedResponse<DisputeFormResponse>>> getDrafts(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute @ParameterObject DraftPageRequest filter) {
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy danh sách bản nháp khiếu nại thành công",
                submissionService.getDrafts(requireUserId(principal), filter.getPage(), filter.getSize())));
    }

    @GetMapping("/drafts/{id}")
    @Operation(summary = "Lấy nội dung bản nháp khiếu nại", description = "Chỉ lấy bản nháp DRAFT của người dùng "
            + "trong JWT, gồm nội dung đã lưu và metadata các tệp đính kèm.")
    public ResponseEntity<BaseResponse<DisputeFormResponse>> getDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Long userId = requireUserId(principal);
        return ResponseEntity.ok(new BaseResponse<>(true, "Lấy bản nháp khiếu nại thành công",
                submissionService.getDraft(userId, requirePositiveId(id))));
    }

    @PostMapping(value = "/drafts/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Gửi hồ sơ từ bản nháp khiếu nại", description = "Gửi đầy đủ các trường như API gửi trực tiếp "
            + "và agreeTerms=true. Backend kiểm tra lại xác thực blacklist còn ACTIVE tại thời điểm gửi. "
            + "Có thể thêm files hoặc xóa tệp đã lưu bằng removedEvidenceIds; phải còn ít nhất một tệp, tối đa 10 tệp. "
            + "Chuyển chính bản nháp sang PENDING, giữ ID hồ sơ; không tạo hồ sơ khác. "
            + "Không thể tiếp tục sửa bản nháp sau khi đã gửi.",
            requestBody = @RequestBody(required = true, content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = SubmitMultipartRequest.class),
                    encoding = @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE))))
    public ResponseEntity<BaseResponse<DisputeFormResponse>> submitDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestPart("request") String request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        Long userId = requireUserId(principal);
        DisputeFormResponse response = submissionService.submitDraft(
                userId, requirePositiveId(id), parseRequest(request, SubmitDisputeRequest.class), files);
        return ResponseEntity.ok(new BaseResponse<>(true, "Hồ sơ khiếu nại đã được gửi và đang chờ thẩm định", response));
    }

    private <T> T parseRequest(String json, Class<T> type) {
        T request;
        try {
            request = objectMapper.readValue(json, type);
        } catch (JacksonException ex) {
            throw new BadRequestException("Part request phải là JSON hợp lệ với giá trị enum đúng định dạng");
        }
        if (request == null) {
            throw new BadRequestException("Part request không được để trống");
        }
        Set<ConstraintViolation<T>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return request;
    }

    private Long requireUserId(UserPrincipal principal) {
        if (principal == null || principal.getId() == null || principal.getId() <= 0) {
            throw new UnauthorizedException("Vui lòng đăng nhập để gửi hoặc lưu nháp khiếu nại");
        }
        return principal.getId();
    }

    private Long requirePositiveId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("ID bản nháp phải lớn hơn 0");
        }
        return id;
    }

    @Data
    public static class DraftPageRequest {
        @Min(value = 0, message = "Chỉ số trang không được nhỏ hơn 0")
        @Max(value = 100000, message = "Chỉ số trang không được lớn hơn 100000")
        @Schema(description = "Chỉ số trang, bắt đầu từ 0", defaultValue = "0")
        private int page = 0;

        @Min(value = 1, message = "Số bản nháp mỗi trang phải từ 1")
        @Max(value = 50, message = "Số bản nháp mỗi trang tối đa 50")
        @Schema(description = "Số bản nháp mỗi trang", defaultValue = "10")
        private int size = 10;
    }

    @Schema(name = "SubmitDisputeMultipart", description = "Multipart gửi hồ sơ khiếu nại")
    public static class SubmitMultipartRequest {
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        public SubmitDisputeRequest request;

        @ArraySchema(schema = @Schema(type = "string", format = "binary"))
        public List<MultipartFile> files;
    }

    @Schema(name = "SaveDisputeDraftMultipart", description = "Multipart lưu bản nháp khiếu nại")
    public static class DraftMultipartRequest {
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        public SaveDisputeDraftRequest request;

        @ArraySchema(schema = @Schema(type = "string", format = "binary"))
        public List<MultipartFile> files;
    }
}
