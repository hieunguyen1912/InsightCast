package com.hieunguyen.podcastai.service.impl;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.hieunguyen.podcastai.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleCloudStorageServiceImpl implements StorageService {

    private final Storage storage;

    @Value("${app.image.storage.gcs.bucket-name}")
    private String bucketName;

    @Value("${app.image.storage.gcs.base-url}")
    private String baseUrl;

    @Override
    public String uploadFile(MultipartFile file, String folderPath) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

            String fullPath = folderPath != null && !folderPath.isEmpty()
                    ? folderPath + "/" + uniqueFilename
                    : uniqueFilename;

            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fullPath)
                    .setContentType(file.getContentType())
                    .build();

            Blob blob = storage.create(blobInfo, file.getBytes());

            // Generate public URL
            String publicUrl = baseUrl != null && !baseUrl.isEmpty()
                    ? baseUrl + "/" + fullPath
                    : "https://storage.googleapis.com/" + bucketName + "/" + fullPath;

            log.info("File uploaded to GCS: gs://{}/{} -> {}", bucketName, fullPath, publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("Error uploading file to GCS: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to cloud storage", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            String filePath = extractPathFromUrl(fileUrl);
            BlobId blobId = BlobId.of(bucketName, filePath);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                log.info("File deleted from GCS: {}", filePath);
            } else {
                log.warn("File not found in GCS: {}", filePath);
            }
        } catch (Exception e) {
            log.error("Error deleting file from GCS: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from cloud storage", e);
        }
    }

    @Override
    public boolean fileExists(String fileUrl) {
        try {
            String filePath = extractPathFromUrl(fileUrl);
            BlobId blobId = BlobId.of(bucketName, filePath);
            Blob blob = storage.get(blobId);
            return blob != null && blob.exists();
        } catch (Exception e) {
            log.error("Error checking file existence: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public InputStream getFileInputStream(String fileUrl) {
        try {
            String filePath = extractPathFromUrl(fileUrl);
            BlobId blobId = BlobId.of(bucketName, filePath);
            Blob blob = storage.get(blobId);

            if (blob == null || !blob.exists()) {
                throw new RuntimeException("File not found: " + fileUrl);
            }

            return new java.io.ByteArrayInputStream(blob.getContent());
        } catch (Exception e) {
            log.error("Error getting file input stream: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get file from cloud storage", e);
        }
    }

    private String extractPathFromUrl(String url) {
        if (url.startsWith("https://storage.googleapis.com/")) {
            String withoutBase = url.substring("https://storage.googleapis.com/".length());
            int firstSlash = withoutBase.indexOf("/");
            if (firstSlash > 0) {
                return withoutBase.substring(firstSlash + 1);
            }
        }
        else if (url.startsWith("https://") && baseUrl != null && !baseUrl.isEmpty() && url.startsWith(baseUrl)) {
            return url.substring(baseUrl.length() + 1);
        }
        else if (url.startsWith("/")) {
            return url.substring(1);
        }
        return url;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
