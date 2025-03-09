package com.taiso.bike_api.exception;

public class BookmarkAlreadyExistsException extends RuntimeException {
    public BookmarkAlreadyExistsException(String message) {
        super(message);
    }
}
