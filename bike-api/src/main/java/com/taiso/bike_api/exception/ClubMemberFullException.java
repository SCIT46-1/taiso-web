package com.taiso.bike_api.exception;

public class ClubMemberFullException extends RuntimeException {
    public ClubMemberFullException(String message) {
        super(message);
    }
}
