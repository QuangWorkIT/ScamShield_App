package com.be.scamshield.service;

import com.be.scamshield.dto.ScamCheckRequest;
import com.be.scamshield.dto.ScamCheckResponse;

public interface IScamCheckService {
    ScamCheckResponse checkContent(ScamCheckRequest request);
}
