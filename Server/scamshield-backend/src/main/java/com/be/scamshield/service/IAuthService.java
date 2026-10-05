package com.be.scamshield.service;

import com.be.scamshield.dto.request.RegisterPersonalRequest;
import com.be.scamshield.dto.request.RegisterGoogleRequest;

public interface IAuthService {
    void registerPersonal(RegisterPersonalRequest request);
    void registerGoogle(RegisterGoogleRequest request);
}
