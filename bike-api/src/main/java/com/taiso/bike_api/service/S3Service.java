package com.taiso.bike_api.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class S3Service {

    // S3버킷 파일관리 관련 클래스
    private final S3Client s3Client;

    // S3 버킷 이름을 설정 파일(application.yml 등)에서 주입
    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String awsRegion;

    // 생성자 주입
    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    // MultipartFile로 넘어온 파일을 S3에 업로드하고 파일 키를 반환
    public String uploadFile(MultipartFile file, Long userId) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new IllegalArgumentException("파일 이름이 없습니다.");
            }
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

            // S3에 저장될 파일 키 (예: users/{userId}/{uuid}{extension})
            String fileKey = "users/" + userId + "/" + UUID.randomUUID() + extension;

            // InputStream과 파일 크기를 사용하여 S3에 업로드
            try (InputStream inputStream = file.getInputStream()) {
                s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(fileKey)
                        .contentType(file.getContentType())
                        .build(), RequestBody.fromInputStream(inputStream, file.getSize()));
            }
            return fileKey; // S3에 저장된 파일 키 반환

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    // MultipartFile로 넘어온 클럽 이미지 파일을 S3에 업로드하고 파일 키를 반환
    public String uploadClubImage(MultipartFile file, Long clubId) {

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("파일 이름이 없습니다.");
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));

        String fileKey = "clubs/" + clubId + "/" + UUID.randomUUID() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .build(), RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
        return fileKey;

    }




    // 바이트 배열을 S3에 업로드하는 메서드 (예: 정적 지도 이미지 업로드)
    public String uploadFile(byte[] bytes, String key, String contentType) {
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build(), RequestBody.fromBytes(bytes));
        return key;
    }

    // 파일 불러오기(다운로드)
    public byte[] getFile(String fileName) {
        try {
            // S3에서 파일 다운로드 요청 생성
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket) // 설정 파일에서 주입된 버킷 사용
                    .key(fileName) // S3에서 다운로드할 파일 이름
                    .build();

            // S3에서 파일 읽기 (바이트 배열로 반환) v2 사용
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
            // 파일을 byte[] 형식으로 반환
            return s3Object.readAllBytes();

        } catch (IOException e) {
            throw new RuntimeException("파일 다운로드 실패", e);
        }
    }

    // S3Client 종료하기
    public void close() {
        s3Client.close();
    }

    // Method to generate pre-signed URL for a specific S3 object
    public String generatePresignedUrl(String objectKey, Duration duration) {
        try (S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build()) {
            
            // 파일명 추출
            String fileName = objectKey.substring(objectKey.lastIndexOf('/') + 1);
            
            // AWS SDK v2에서는 ResponseHeaderOverrides 대신 GetObjectRequest에 직접 설정
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .responseContentDisposition("attachment; filename=\"" + fileName + "\"")
                    .responseContentType("application/octet-stream")
                    .responseCacheControl("no-cache")
                    .responseExpires(null) // 응답 만료 설정 안함
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(duration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }
    public String getFileUrl(String key) {
        // 가상 호스팅 스타일 URL (예: https://bucket.s3.region.amazonaws.com/key)
        return "https://" + bucket + ".s3." + awsRegion + ".amazonaws.com/" + key;
    }
    
    /**
     * 지정된 S3 객체에 대한 presigned URL을 생성합니다.
     * @param objectKey S3 객체 키
     * @param expirationHours URL의 유효 시간(시간 단위)
     * @return 생성된 presigned URL
     */
    public String generatePresignedUrl(String objectKey, int expirationHours) {
        // 주어진 시간을 Duration으로 변환
        Duration duration = Duration.ofHours(expirationHours);
        
        // 기존 메서드 호출
        return generatePresignedUrl(objectKey, duration);
    }
}

