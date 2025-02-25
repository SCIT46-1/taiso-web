package com.taiso.bike_api.exception;

import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.taiso.bike_api.dto.ErrorResponseDTO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // BD에 존재하지 않는 데이터 예외 처리
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoSuchElementException(NoSuchElementException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 루트 예외 처리
    @ExceptionHandler(RouteNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleRouteNotFoundException(RouteNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 지원하지 않는 enum 예외 처리
    @ExceptionHandler(UnsupportedEnumException.class)
    public ResponseEntity<ErrorResponseDTO> handleUnsupportedEnumException(UnsupportedEnumException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // 정적 지도 이미지 가져오기 예외 처리
    @ExceptionHandler(StaticMapImageFetchException.class)
    public ResponseEntity<ErrorResponseDTO> handleStaticMapImageFetchException(StaticMapImageFetchException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    // 파일 크기 초과 예외 처리
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDTO> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.PAYLOAD_TOO_LARGE, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorResponse);
    }

    // 파일 확장자 예외 처리
    @ExceptionHandler(InvalidFileExtensionException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidFileExtensionException(InvalidFileExtensionException ex, HttpServletRequest request) {
        log.error("InvalidFileExtensionException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // 사용자 role 예외 처리
    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleRoleNotFoundException(RoleNotFoundException ex, HttpServletRequest request) {
        log.error("RoleNotFoundException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 사용자 status 예외 처리
    @ExceptionHandler(StatusNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleStatusNotFoundException(StatusNotFoundException ex, HttpServletRequest request) {
        log.error("StatusNotFoundException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 이메일 중복 예외 처리
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex, HttpServletRequest request) {
        log.error("EmailAlreadyExistsException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    // 로그인 인증 정보 예외 처리
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        log.error("BadCredentialsException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.UNAUTHORIZED, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse); 
    }

    // 사용자 예외 처리
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUserNotFoundException(UserNotFoundException ex, HttpServletRequest request) {
        log.error("UserNotFoundException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
    
    // 카카오 인증 예외 처리
    @ExceptionHandler(KakaoAuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleKakaoAuthenticationException(KakaoAuthenticationException ex, HttpServletRequest request) {
        log.error("KakaoAuthenticationException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.UNAUTHORIZED, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    // 기타 예외 처리 (선택 사항)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                "서버에 문제가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
    
    // 루트 좋아요 찾을 수 없음
    @ExceptionHandler(RouteLikeNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleRouteLikeNotFoundException(RouteLikeNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 루트 좋아요 이미 있음 
    @ExceptionHandler(RouteLikeAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleRouteLikeAlreadyExistsException(RouteLikeAlreadyExistsException ex, HttpServletRequest request) {
        log.error("RouteLikeAlreadyExistsException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }	
    
    // 루트 좋아요 이미 삭제
    @ExceptionHandler(RouteLikeDeleteAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleRouteLikeDeleteAlreadyExistsException(RouteLikeDeleteAlreadyExistsException ex, HttpServletRequest request) {
        log.error("RouteLikeDeleteAlreadyExistsException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    @ExceptionHandler(RouteDeleteAccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleRouteDeleteAccessDeniedException(RouteDeleteAccessDeniedException ex, HttpServletRequest request) {
        log.error("RouteDeleteAccessDeniedException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.FORBIDDEN, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }
    
    // 유효성 검증 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.error("MethodArgumentNotValidException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.BAD_REQUEST, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // 미존재 번개 예외 처리
    @ExceptionHandler(LightningNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningNotFoundException(LightningNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 번개 수정 권한 없음 예외 처리
    @ExceptionHandler(NotPermissionException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotPermissionException(NotPermissionException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.FORBIDDEN, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // 번개 수정 불가 상태 예외 처리
    @ExceptionHandler(LightningFullMemberException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningFullMemberException(LightningFullMemberException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.FORBIDDEN, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // 이미 참여한 번개 예외 처리
    @ExceptionHandler(LightningUserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningUserAlreadyExistsException(LightningUserAlreadyExistsException ex, HttpServletRequest request) {
        log.error("LightningUserAlreadyExistsException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }    
    
    // 유저 아이디와 번개 생성자 불일치 예외 처리
    @ExceptionHandler(LightningCreatorMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningCreatorMismatchException(LightningCreatorMismatchException ex, HttpServletRequest request) {
        log.error("LightningCreatorMismatchException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.FORBIDDEN, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // 번개에 해당 유저가 존재하지 않을 때 예외 처리
    @ExceptionHandler(LightningUserNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningUserNotFoundException(LightningUserNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 번개에 해당 유저가 존재하지 않을 때(생성에 필요한 값 누락) 예외 처리
    @ExceptionHandler(LightningCreateMissingValueException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningCreateMissingValueException(LightningCreateMissingValueException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
    
    // 모집 상태가 아닌 번개에 참가 예외 처리
    @ExceptionHandler(LightningStatusMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningStatusMismatchException(LightningStatusMismatchException ex, HttpServletRequest request) {
        log.error("LightningStatusMismatchException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    // 번개 유저 DB에 해당 유저가 존재하지 않을 경우 예외 처리
    @ExceptionHandler(LightningMemberNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningMemberNotFoundException(LightningMemberNotFoundException ex, HttpServletRequest request) {
        log.error("LightningMemberNotFoundException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // 번개 유저 상태 변경 권한 없음 예외 처리
    @ExceptionHandler(LightningMemberIllegalParticipantStatusException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningMemberIllegalParticipantStatusException(
            LightningMemberIllegalParticipantStatusException ex, HttpServletRequest request) {
        log.error("LightningMemberIllegalParticipantStatusException: ", ex);
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.CONFLICT, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    // 번개 참가 신청자 존재하지 않음 예외 처리
    @ExceptionHandler(LightningUserMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleLightningUserMismatchException(LightningUserMismatchException ex, HttpServletRequest request) {
        ErrorResponseDTO errorResponse = ErrorResponseDTO.makeErrorResponse(
                ex.getMessage(), HttpStatus.NOT_FOUND, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
}
