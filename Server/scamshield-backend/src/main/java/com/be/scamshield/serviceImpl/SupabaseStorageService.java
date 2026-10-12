package com.be.scamshield.serviceImpl;

import com.be.scamshield.dto.response.PresignedUrlResponse;
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
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Slf4j
public class SupabaseStorageService {

    @Value("${SUPABASE_STORAGE_REGION:${AWS_REGION:${app.supabase.storage.region:${app.aws.s3.region:ap-south-1}}}}")
    private String region;

    @Value("${SUPABASE_STORAGE_ACCESS_KEY:${AWS_ACCESS_KEY_ID:${app.supabase.storage.access-key-id:}}}")
    private String accessKeyId;

    @Value("${SUPABASE_STORAGE_SECRET_KEY:${AWS_SECRET_ACCESS_KEY:${app.supabase.storage.secret-access-key:}}}")
    private String secretAccessKey;

    @Value("${SUPABASE_STORAGE_BUCKET_NAME:${AWS_S3_BUCKET_NAME:${app.supabase.storage.bucket-name:evidences}}}")
    private String bucketName;

    @Value("${SUPABASE_STORAGE_ENDPOINT:${AWS_S3_ENDPOINT_OVERRIDE:${app.supabase.storage.endpoint-override:}}}")
    private String endpointOverride;

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("[SupabaseStorageService] Initialized with AccessKeyId='{}', Endpoint='{}', Bucket='{}'", 
                getAccessKeyId(), getEndpointOverride(), getBucketName());
        if (isStorageConfigured()) {
            log.info("Supabase Storage successfully configured: bucket={}, endpoint={}, region={}", 
                    getBucketName(), getEndpointOverride(), getRegion());
        } else {
            log.warn("Supabase Storage credentials NOT detected. Please check SUPABASE_STORAGE_ACCESS_KEY / AWS_ACCESS_KEY_ID, SUPABASE_STORAGE_SECRET_KEY / AWS_SECRET_ACCESS_KEY, and SUPABASE_STORAGE_ENDPOINT / AWS_S3_ENDPOINT_OVERRIDE in .env");
        }
    }

    public boolean isStorageConfigured() {
        return StringUtils.hasText(getAccessKeyId()) 
                && StringUtils.hasText(getSecretAccessKey()) 
                && StringUtils.hasText(getEndpointOverride());
    }

    public boolean isAwsConfigured() {
        return isStorageConfigured();
    }

    private String getAccessKeyId() {
        if (StringUtils.hasText(accessKeyId)) {
            return accessKeyId.trim();
        }
        for (String key : new String[]{"SUPABASE_STORAGE_ACCESS_KEY", "AWS_ACCESS_KEY_ID"}) {
            String prop = System.getProperty(key);
            if (StringUtils.hasText(prop)) return prop.trim();
            String env = System.getenv(key);
            if (StringUtils.hasText(env)) return env.trim();
        }
        return "";
    }

    private String getSecretAccessKey() {
        if (StringUtils.hasText(secretAccessKey)) {
            return secretAccessKey.trim();
        }
        for (String key : new String[]{"SUPABASE_STORAGE_SECRET_KEY", "AWS_SECRET_ACCESS_KEY"}) {
            String prop = System.getProperty(key);
            if (StringUtils.hasText(prop)) return prop.trim();
            String env = System.getenv(key);
            if (StringUtils.hasText(env)) return env.trim();
        }
        return "";
    }

    private String getEndpointOverride() {
        if (StringUtils.hasText(endpointOverride)) {
            return endpointOverride.trim();
        }
        for (String key : new String[]{"SUPABASE_STORAGE_ENDPOINT", "AWS_S3_ENDPOINT_OVERRIDE"}) {
            String prop = System.getProperty(key);
            if (StringUtils.hasText(prop)) return prop.trim();
            String env = System.getenv(key);
            if (StringUtils.hasText(env)) return env.trim();
        }
        return "";
    }

    private String getBucketName() {
        if (StringUtils.hasText(bucketName)) {
            return bucketName.trim();
        }
        for (String key : new String[]{"SUPABASE_STORAGE_BUCKET_NAME", "AWS_S3_BUCKET_NAME"}) {
            String prop = System.getProperty(key);
            if (StringUtils.hasText(prop)) return prop.trim();
            String env = System.getenv(key);
            if (StringUtils.hasText(env)) return env.trim();
        }
        return "evidences";
    }

    private String getRegion() {
        if (StringUtils.hasText(region)) {
            return region.trim();
        }
        for (String key : new String[]{"SUPABASE_STORAGE_REGION", "AWS_REGION"}) {
            String prop = System.getProperty(key);
            if (StringUtils.hasText(prop)) return prop.trim();
            String env = System.getenv(key);
            if (StringUtils.hasText(env)) return env.trim();
        }
        return "ap-south-1";
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

            if (!isStorageConfigured()) {
                throw new IllegalArgumentException("Supabase Storage credentials are not configured. Please set SUPABASE_STORAGE_ACCESS_KEY / AWS_ACCESS_KEY_ID, SUPABASE_STORAGE_SECRET_KEY, and SUPABASE_STORAGE_ENDPOINT in .env!");
            }

            try (S3Client s3Client = createS3Client()) {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(getBucketName())
                        .key(objectKey)
                        .contentType(file.getContentType())
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
            }

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

    public void deleteFile(String objectKey) {
        if (!isStorageConfigured() || !StringUtils.hasText(objectKey)) {
            return;
        }
        try (S3Client s3Client = createS3Client()) {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("Deleted object from Supabase Storage: {}", objectKey);
        } catch (Exception e) {
            log.warn("Failed to delete file from Supabase Storage [key={}]: {}", objectKey, e.getMessage());
        }
    }

    public PresignedUrlResponse generatePresignedUploadUrl(String fileName, String contentType) {
        String extension = StringUtils.getFilenameExtension(fileName);
        String objectKey = String.format("evidences/presigned_%s_%s%s",
                UUID.randomUUID().toString().substring(0, 8),
                System.currentTimeMillis(),
                extension != null ? "." + extension : "");

        long expirationSeconds = 900; // 15 minutes

        if (!isStorageConfigured()) {
            throw new IllegalArgumentException("Supabase Storage credentials are not configured. Please set SUPABASE_STORAGE_ACCESS_KEY / AWS_ACCESS_KEY_ID, SUPABASE_STORAGE_SECRET_KEY, and SUPABASE_STORAGE_ENDPOINT in .env!");
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
            log.error("Failed to generate presigned URL for Supabase Storage: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to generate Supabase Storage presigned URL: " + e.getMessage(), e);
        }
    }

    public String buildPublicUrl(String objectKey) {
        String override = getEndpointOverride();
        if (!StringUtils.hasText(override)) {
            throw new IllegalStateException("Supabase Storage endpoint is not configured!");
        }
        if (override.contains("supabase.co")) {
            String baseUrl = override.replaceAll("/storage/v1/s3/?$", "");
            return String.format("%s/storage/v1/object/public/%s/%s", baseUrl, getBucketName(), objectKey);
        }
        return String.format("%s/%s/%s", override, getBucketName(), objectKey);
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
        String override = getEndpointOverride();
        if (!StringUtils.hasText(override)) {
            throw new IllegalStateException("Supabase Storage endpoint is not configured!");
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(getAccessKeyId(), getSecretAccessKey());
        return S3Client.builder()
                .region(Region.of(getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .endpointOverride(java.net.URI.create(override))
                .forcePathStyle(true)
                .build();
    }

    private S3Presigner createS3Presigner() {
        String override = getEndpointOverride();
        if (!StringUtils.hasText(override)) {
            throw new IllegalStateException("Supabase Storage endpoint is not configured!");
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(getAccessKeyId(), getSecretAccessKey());
        return S3Presigner.builder()
                .region(Region.of(getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .endpointOverride(java.net.URI.create(override))
                .build();
    }

    public record UploadResult(String fileUrl, String fileHash, String objectKey, String originalFilename) {}
}
