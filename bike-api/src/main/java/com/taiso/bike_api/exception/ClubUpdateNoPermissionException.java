package com.taiso.bike_api.exception;

public class ClubUpdateNoPermissionException extends RuntimeException {

    public ClubUpdateNoPermissionException(String message) {
        super(message);
    }
    
}
