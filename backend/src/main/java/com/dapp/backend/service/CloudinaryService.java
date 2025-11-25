package com.dapp.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload file to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary (e.g., "user", "center", "vaccine")
     * @return URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto"
            )
        );
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Delete file from Cloudinary by public_id
     * @param publicId Public ID of the file to delete (extracted from URL)
     */
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Extract public_id from Cloudinary URL
     * @param url Full Cloudinary URL
     * @return public_id or null if extraction fails
     */
    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{extension}
            String[] parts = url.split("/upload/");
            if (parts.length < 2) return null;
            
            String pathAfterUpload = parts[1];
            // Remove version if present (v1234567890/)
            String withoutVersion = pathAfterUpload.replaceFirst("v\\d+/", "");
            // Remove file extension
            int lastDot = withoutVersion.lastIndexOf('.');
            if (lastDot > 0) {
                return withoutVersion.substring(0, lastDot);
            }
            return withoutVersion;
        } catch (Exception e) {
            return null;
        }
    }
}
