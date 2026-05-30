package net.fruadly.learningservice.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.fruadly.learningservice.dto.ResourceDto;
import net.fruadly.learningservice.service.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Transactional
public class ResourceController {
    private final S3Service storageService;

    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_ADMIN')")
    @PostMapping("/{chapterId}")
    public ResponseEntity<Map<String, ResourceDto>> upload(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam String type,
            @RequestParam(value = "lien", required = false) String lien,
            @PathVariable UUID chapterId) throws IOException {

        ResourceDto resource = storageService.uploadResource(file, type, lien, chapterId);
        return ResponseEntity.ok(Map.of("resource", resource));
    }


}