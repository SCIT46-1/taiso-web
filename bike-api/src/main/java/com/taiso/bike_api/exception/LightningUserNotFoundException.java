package com.taiso.bike_api.exception;

public class LightningUserNotFoundException extends RuntimeException {
    public LightningUserNotFoundException(String message) {
        super(message);
    }
}
