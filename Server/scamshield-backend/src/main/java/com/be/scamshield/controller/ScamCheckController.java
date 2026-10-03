package com.be.scamshield.controller;

import com.be.scamshield.dto.BaseResponse;
import com.be.scamshield.dto.ScamCheckRequest;
import com.be.scamshield.dto.ScamCheckResponse;
import com.be.scamshield.service.IScamCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/scam-check")
@RequiredArgsConstructor
@Tag(name = "Scam Check API", description = "API for checking scam messages/calls")
public class ScamCheckController {

    private final IScamCheckService scamCheckService;

    @PostMapping
    @Operation(summary = "Check if content is a scam")
    public ResponseEntity<BaseResponse<ScamCheckResponse>> checkContent(@RequestBody ScamCheckRequest request) {
        ScamCheckResponse data = scamCheckService.checkContent(request);
        return ResponseEntity.ok(new BaseResponse<>(true, "Check completed successfully", data));
    }
    
    @GetMapping("/ping")
    @Operation(summary = "Health check ping")
    public ResponseEntity<BaseResponse<String>> ping() {
        return ResponseEntity.ok(new BaseResponse<>(true, "Ping successful", "Pong! Service is running."));
    }
}
