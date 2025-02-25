package com.taiso.bike_api.exception;

public class LightningUserStatusNotPendingException extends RuntimeException   {
    public LightningUserStatusNotPendingException(String message) {
        super(message);
    }

}
