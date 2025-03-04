package com.taiso.bike_api.exception;

public class ClubMemberAlreadyExistsException extends RuntimeException {
    public ClubMemberAlreadyExistsException(String message) {
        super(message);
    }
}
