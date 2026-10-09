package com.be.scamshield.serviceImpl;

import com.be.scamshield.dto.response.PresignedUrlResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.InputStream;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class S3StorageService {

    @Value("${app.aws.s3.region:ap-southeast-1}")
    private String region;

    @Value("${app.aws.s3.access-key-id:}")
    private String accessKeyId;

    @Value("${app.aws.s3.secret-access-key:}")
    private String secretAccessKey;

    @Value("${app.aws.s3.bucket-name:scamshield-evidence-bucket}")
    private String bucketName;

    @Value("${app.aws.s3.endpoint-override:}")
    private String endpointOverride;

    public boolean isAwsConfigured() {
        return StringUtils.hasText(accessKeyId) && StringUtils.hasText(secretAccessKey);
    }

    public UploadResult uploadFile(MultipartFile file, String folder) {
        try {
            byte[] bytes = file.getBytes();
            String fileHash = calculateHash(bytes);
            String originalFilename = file.getOriginalFilename();
            String extension = StringUtils.getFilenameExtension(originalFilename);
            String objectKey = String.format("%s/%s_%s%s", 
                    folder, 
                    UUID.randomUUID().toString().substring(0, 8), 
                    System.currentTimeMillis(),
                    extension != null ? "." + extension : "");

            String fileUrl;
            if (isAwsConfigured()) {
                S3Client s3Client = createS3Client();
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(file.getContentType())
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
                fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);
                log.info("File uploaded successfully to AWS S3: {}", fileUrl);
            } else {
                fileUrl = String.format("https://s3.localmock.scamshield.vn/%s/%s", bucketName, objectKey);
                log.warn("AWS S3 credentials not provided. Generated mock S3 URL: {}", fileUrl);
            }

            return new UploadResult(fileUrl, fileHash, objectKey, originalFilename);
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Tải tệp lên S3 thất bại: " + e.getMessage(), e);
        }
    }

    public PresignedUrlResponse generatePresignedUploadUrl(String fileName, String contentType) {
        String extension = StringUtils.getFilenameExtension(fileName);
        String objectKey = String.format("evidences/presigned_%s_%s%s",
                UUID.randomUUID().toString().substring(0, 8),
                System.currentTimeMillis(),
                extension != null ? "." + extension : "");

        long expirationSeconds = 900; // 15 minutes

        if (isAwsConfigured()) {
            try (S3Presigner presigner = createS3Presigner()) {
                PutObjectRequest objectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(contentType)
                        .build();

                PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofSeconds(expirationSeconds))
                        .putObjectRequest(objectRequest)
                        .build();

                PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
                String uploadUrl = presignedRequest.url().toString();
                String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);

                return PresignedUrlResponse.builder()
                        .uploadUrl(uploadUrl)
                        .fileUrl(fileUrl)
                        .objectKey(objectKey)
                        .expiresInSeconds(expirationSeconds)
                        .build();
            }
        } else {
            String fileUrl = String.format("https://s3.localmock.scamshield.vn/%s/%s", bucketName, objectKey);
            String mockUploadUrl = String.format("https://s3.localmock.scamshield.vn/upload/%s", objectKey);
            return PresignedUrlResponse.builder()
                    .uploadUrl(mockUploadUrl)
                    .fileUrl(fileUrl)
                    .objectKey(objectKey)
                    .expiresInSeconds(expirationSeconds)
                    .build();
        }
    }

    public String calculateHash(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(fileBytes);
            return HexFormat.of().formatHex(encodedHash);
        } catch (Exception e) {
            log.error("Failed to compute SHA-256 hash", e);
            return "HASH_ERROR";
        }
    }

    private S3Client createS3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials));

        if (StringUtils.hasText(endpointOverride)) {
            builder.endpointOverride(java.net.URI.create(endpointOverride))
                   .forcePathStyle(true);
        }
        return builder.build();
    }

    private S3Presigner createS3Presigner() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        var builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials));

        if (StringUtils.hasText(endpointOverride)) {
            builder.endpointOverride(java.net.URI.create(endpointOverride));
        }
        return builder.build();
    }

    public record UploadResult(String fileUrl, String fileHash, String objectKey, String originalFilename) {}
}
