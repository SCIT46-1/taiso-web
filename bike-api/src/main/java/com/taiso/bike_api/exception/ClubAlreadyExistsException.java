package com.taiso.bike_api.exception;

public class ClubAlreadyExistsException extends RuntimeException {
    public ClubAlreadyExistsException(String message) {
        super(message);
    }

}
