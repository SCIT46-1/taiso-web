package com.taiso.bike_api.exception;

public class ClubMemberNotFoundException extends RuntimeException {
    public ClubMemberNotFoundException(String message) {
        super(message);
    }
}
