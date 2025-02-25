package com.taiso.bike_api.exception;

public class LightningStatusMismatchException extends RuntimeException {
    public LightningStatusMismatchException(String message) {
        super(message);
    }
}
