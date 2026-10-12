package com.be.scamshield.service;

import com.be.scamshield.dto.request.RegisterPartnerRequest;
import com.be.scamshield.dto.response.PartnerRegistrationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPartnerRegistrationService {
    PartnerRegistrationResponse register(RegisterPartnerRequest request,
                                         List<MultipartFile> businessLicenseFiles,
                                         List<MultipartFile> ownershipProofFiles,
                                         List<MultipartFile> authorizationFiles);
}
