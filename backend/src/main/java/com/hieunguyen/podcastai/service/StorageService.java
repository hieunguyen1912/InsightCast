package com.hieunguyen.podcastai.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    String uploadFile(MultipartFile file, String folderPath);

    void deleteFile(String fileUrl);

    boolean fileExists(String fileUrl);

    InputStream getFileInputStream(String fileUrl);
}