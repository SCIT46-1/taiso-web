package com.taiso.bike_api.exception;

public class BookmarkNotFoundException extends RuntimeException {
    public BookmarkNotFoundException(String message) {
        super(message);
    }
}
