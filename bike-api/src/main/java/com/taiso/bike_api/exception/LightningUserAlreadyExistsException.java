package com.taiso.bike_api.exception;

public class LightningUserAlreadyExistsException extends RuntimeException  {
    public LightningUserAlreadyExistsException(String message) {
        super(message);
    }

}
