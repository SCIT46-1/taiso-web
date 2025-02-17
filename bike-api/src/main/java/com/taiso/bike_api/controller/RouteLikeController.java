package com.taiso.bike_api.controller;

import com.taiso.bike_api.dto.RouteLikeDTO;
import com.taiso.bike_api.service.RouteLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/routes")
public class RouteLikeController {

    @Autowired
    private RouteLikeService routeLikeService;

    @PostMapping("/{routeId}/like")
    public ResponseEntity<Object> addLike(@PathVariable Long routeId, @RequestParam Long userId) {
        try {
            // 서비스에서 좋아요 등록 처리
            RouteLikeDTO routeLikeDTO = routeLikeService.addLike(routeId, userId);
            // 좋아요 등록 성공 시 응답
            return new ResponseEntity<>(routeLikeDTO, HttpStatus.CREATED);
        } catch (RuntimeException ex) {
            // 루트나 사용자 정보가 없을 경우
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            // 예상치 못한 예외 처리
            return new ResponseEntity<>("알 수 없는 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
        // } catch (DataIntegrityViolationException ex) {
        //     // 이미 좋아요를 등록한 경우
        //     return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
        // } 
        
}
