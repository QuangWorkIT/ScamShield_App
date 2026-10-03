package com.be.scamshield.serviceImpl;

import com.be.scamshield.dto.ScamCheckRequest;
import com.be.scamshield.dto.ScamCheckResponse;
import com.be.scamshield.exception.BadRequestException;
import com.be.scamshield.service.IScamCheckService;
import org.springframework.stereotype.Service;

@Service
public class ScamCheckServiceImpl implements IScamCheckService {

    @Override
    public ScamCheckResponse checkContent(ScamCheckRequest request) {
        // Dummy logic for sample
        boolean isScam = request.getContent() != null && request.getContent().toLowerCase().contains("chúc mừng");

        if (request.getContent() == null || request.getContent().isBlank())
            throw new BadRequestException("Nội dung không được trống");
        
        return ScamCheckResponse.builder()
                .isScam(isScam)
                .confidenceScore(isScam ? 0.95 : 0.10)
                .message(isScam ? "Cảnh báo: Nội dung có dấu hiệu lừa đảo!" : "Nội dung an toàn.")
                .build();
    }
}
