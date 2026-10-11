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

    @Value("${AWS_REGION:${app.aws.s3.region:ap-south-1}}")
    private String region;

    @Value("${AWS_ACCESS_KEY_ID:${app.aws.s3.access-key-id:}}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:${app.aws.s3.secret-access-key:}}")
    private String secretAccessKey;

    @Value("${AWS_S3_BUCKET_NAME:${app.aws.s3.bucket-name:evidences}}")
    private String bucketName;

    @Value("${AWS_S3_ENDPOINT_OVERRIDE:${app.aws.s3.endpoint-override:}}")
    private String endpointOverride;

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("[S3StorageService] Initialized with AccessKeyId='{}', Endpoint='{}', Bucket='{}'", 
                getAccessKeyId(), getEndpointOverride(), getBucketName());
        if (isAwsConfigured()) {
            log.info("S3/Supabase Storage successfully configured: bucket={}, endpoint={}, region={}", 
                    getBucketName(), getEndpointOverride(), getRegion());
        } else {
            log.warn("S3/Supabase Storage credentials NOT detected. Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
        }
    }

    public boolean isAwsConfigured() {
        return StringUtils.hasText(getAccessKeyId()) && StringUtils.hasText(getSecretAccessKey());
    }

    private String getAccessKeyId() {
        if (StringUtils.hasText(accessKeyId)) {
            return accessKeyId.trim();
        }
        String sysProp = System.getProperty("AWS_ACCESS_KEY_ID");
        if (StringUtils.hasText(sysProp)) {
            return sysProp.trim();
        }
        String sysEnv = System.getenv("AWS_ACCESS_KEY_ID");
        if (StringUtils.hasText(sysEnv)) {
            return sysEnv.trim();
        }
        com.be.scamshield.config.EnvLoader.loadEnv();
        String reloaded = System.getProperty("AWS_ACCESS_KEY_ID");
        return StringUtils.hasText(reloaded) ? reloaded.trim() : "";
    }

    private String getSecretAccessKey() {
        if (StringUtils.hasText(secretAccessKey)) {
            return secretAccessKey.trim();
        }
        String sysProp = System.getProperty("AWS_SECRET_ACCESS_KEY");
        if (StringUtils.hasText(sysProp)) {
            return sysProp.trim();
        }
        String sysEnv = System.getenv("AWS_SECRET_ACCESS_KEY");
        if (StringUtils.hasText(sysEnv)) {
            return sysEnv.trim();
        }
        com.be.scamshield.config.EnvLoader.loadEnv();
        String reloaded = System.getProperty("AWS_SECRET_ACCESS_KEY");
        return StringUtils.hasText(reloaded) ? reloaded.trim() : "";
    }

    private String getEndpointOverride() {
        if (StringUtils.hasText(endpointOverride)) {
            return endpointOverride.trim();
        }
        String sysProp = System.getProperty("AWS_S3_ENDPOINT_OVERRIDE");
        if (StringUtils.hasText(sysProp)) {
            return sysProp.trim();
        }
        String sysEnv = System.getenv("AWS_S3_ENDPOINT_OVERRIDE");
        if (StringUtils.hasText(sysEnv)) {
            return sysEnv.trim();
        }
        com.be.scamshield.config.EnvLoader.loadEnv();
        String reloaded = System.getProperty("AWS_S3_ENDPOINT_OVERRIDE");
        return StringUtils.hasText(reloaded) ? reloaded.trim() : "";
    }

    private String getBucketName() {
        if (StringUtils.hasText(bucketName)) {
            return bucketName.trim();
        }
        String sysProp = System.getProperty("AWS_S3_BUCKET_NAME");
        if (StringUtils.hasText(sysProp)) {
            return sysProp.trim();
        }
        String sysEnv = System.getenv("AWS_S3_BUCKET_NAME");
        if (StringUtils.hasText(sysEnv)) {
            return sysEnv.trim();
        }
        com.be.scamshield.config.EnvLoader.loadEnv();
        String reloaded = System.getProperty("AWS_S3_BUCKET_NAME");
        return StringUtils.hasText(reloaded) ? reloaded.trim() : "evidences";
    }

    private String getRegion() {
        if (StringUtils.hasText(region)) {
            return region.trim();
        }
        String sysProp = System.getProperty("AWS_REGION");
        if (StringUtils.hasText(sysProp)) {
            return sysProp.trim();
        }
        String sysEnv = System.getenv("AWS_REGION");
        if (StringUtils.hasText(sysEnv)) {
            return sysEnv.trim();
        }
        com.be.scamshield.config.EnvLoader.loadEnv();
        String reloaded = System.getProperty("AWS_REGION");
        return StringUtils.hasText(reloaded) ? reloaded.trim() : "ap-south-1";
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

            if (!isAwsConfigured()) {
                throw new IllegalArgumentException("Supabase Storage credentials are not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_ENDPOINT_OVERRIDE in .env!");
            }

            S3Client s3Client = createS3Client();
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
            String fileUrl = buildPublicUrl(objectKey);
            log.info("File uploaded successfully to Supabase Storage: {}", fileUrl);

            return new UploadResult(fileUrl, fileHash, objectKey, originalFilename);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload file to Supabase Storage: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to upload file to Supabase Storage: " + e.getMessage(), e);
        }
    }

    public PresignedUrlResponse generatePresignedUploadUrl(String fileName, String contentType) {
        String extension = StringUtils.getFilenameExtension(fileName);
        String objectKey = String.format("evidences/presigned_%s_%s%s",
                UUID.randomUUID().toString().substring(0, 8),
                System.currentTimeMillis(),
                extension != null ? "." + extension : "");

        long expirationSeconds = 900; // 15 minutes

        if (!isAwsConfigured()) {
            throw new IllegalArgumentException("Supabase Storage credentials are not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_ENDPOINT_OVERRIDE in .env!");
        }

        try (S3Presigner presigner = createS3Presigner()) {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(expirationSeconds))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
            String uploadUrl = presignedRequest.url().toString();
            String fileUrl = buildPublicUrl(objectKey);

            return PresignedUrlResponse.builder()
                    .uploadUrl(uploadUrl)
                    .fileUrl(fileUrl)
                    .objectKey(objectKey)
                    .expiresInSeconds(expirationSeconds)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to generate S3 presigned URL: " + e.getMessage(), e);
        }
    }

    public String buildPublicUrl(String objectKey) {
        String override = getEndpointOverride();
        if (StringUtils.hasText(override)) {
            if (override.contains("supabase.co")) {
                String baseUrl = override.replaceAll("/storage/v1/s3/?$", "");
                return String.format("%s/storage/v1/object/public/%s/%s", baseUrl, getBucketName(), objectKey);
            }
            return String.format("%s/%s/%s", override, getBucketName(), objectKey);
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", getBucketName(), getRegion(), objectKey);
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
        AwsBasicCredentials credentials = AwsBasicCredentials.create(getAccessKeyId(), getSecretAccessKey());
        var builder = S3Client.builder()
                .region(Region.of(region != null ? region.trim() : "ap-southeast-1"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials));

        String override = getEndpointOverride();
        if (StringUtils.hasText(override)) {
            builder.endpointOverride(java.net.URI.create(override))
                   .forcePathStyle(true);
        }
        return builder.build();
    }

    private S3Presigner createS3Presigner() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(getAccessKeyId(), getSecretAccessKey());
        var builder = S3Presigner.builder()
                .region(Region.of(region != null ? region.trim() : "ap-southeast-1"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials));

        String override = getEndpointOverride();
        if (StringUtils.hasText(override)) {
            builder.endpointOverride(java.net.URI.create(override));
        }
        return builder.build();
    }

    public record UploadResult(String fileUrl, String fileHash, String objectKey, String originalFilename) {}
}
