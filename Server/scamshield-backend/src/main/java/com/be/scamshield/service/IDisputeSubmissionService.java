package com.be.scamshield.service;

import com.be.scamshield.dto.PaginatedResponse;
import com.be.scamshield.dto.request.SaveDisputeDraftRequest;
import com.be.scamshield.dto.request.SubmitDisputeRequest;
import com.be.scamshield.dto.response.DisputeFormResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IDisputeSubmissionService {

    DisputeFormResponse submit(Long userId, SubmitDisputeRequest request, List<MultipartFile> files);

    DisputeFormResponse createDraft(Long userId, SaveDisputeDraftRequest request, List<MultipartFile> files);

    DisputeFormResponse updateDraft(Long userId, Long draftId, SaveDisputeDraftRequest request, List<MultipartFile> files);

    DisputeFormResponse getDraft(Long userId, Long draftId);

    PaginatedResponse<DisputeFormResponse> getDrafts(Long userId, int page, int size);

    DisputeFormResponse submitDraft(Long userId, Long draftId, SubmitDisputeRequest request, List<MultipartFile> files);
}
