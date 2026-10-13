package com.be.scamshield.exception;

public class DisputeStorageException extends RuntimeException {

    public DisputeStorageException(String message) {
        super(message);
    }

    public DisputeStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
