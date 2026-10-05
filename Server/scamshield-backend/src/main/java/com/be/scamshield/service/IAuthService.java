package com.be.scamshield.service;

import com.be.scamshield.dto.request.RegisterPersonalRequest;

public interface IAuthService {
    void registerPersonal(RegisterPersonalRequest request);
}
