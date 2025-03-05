package com.taiso.bike_api.exception;

public class ClubLeaderCannotLeaveException extends RuntimeException {
    public ClubLeaderCannotLeaveException(String message) {
        super(message);
    }
}
