package com.taiso.bike_api.exception;

public class LightningNotFoundException extends RuntimeException {
    public LightningNotFoundException(String message) {
        super(message);
    }
}
