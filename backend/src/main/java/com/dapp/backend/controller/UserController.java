package com.dapp.backend.controller;

import com.dapp.backend.dto.request.UserRequest;
import com.dapp.backend.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.User;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.service.UserService;
import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/patients")
    @ApiMessage("Get all patients")
    public ResponseEntity<Pagination> getAllPatients(@Filter Specification<User> specification,
            Pageable pageable) {
        specification = Specification.where(specification)
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), false))
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("role").get("name"), "PATIENT"));
        return ResponseEntity.ok().body(userService.getAllUsers(specification, pageable));
    }

    @GetMapping("/cashiers")
    @ApiMessage("Get all cashiers")
    public ResponseEntity<Pagination> getAllCashiers(@Filter Specification<User> specification,
            Pageable pageable) {
        specification = Specification.where(specification)
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), false))
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("role").get("name"), "CASHIER"));
        return ResponseEntity.ok().body(userService.getAllUsers(specification, pageable));
    }

    @GetMapping("/doctors")
    @ApiMessage("Get all doctors")
    public ResponseEntity<Pagination> getAllDoctors(@Filter Specification<User> specification,
            Pageable pageable) {
        specification = Specification.where(specification)
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), false))
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("role").get("name"), "DOCTOR"));
        return ResponseEntity.ok().body(userService.getAllUsers(specification, pageable));
    }

    @PutMapping
    @ApiMessage("Update a user")
    public ResponseEntity<UserResponse> updateUser(@Valid @RequestBody UserRequest request)
            throws AppException {
        return ResponseEntity.ok().body(userService.updateUser(request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a user")
    public void deleteUser(@PathVariable long id) throws AppException {
        userService.deleteUser(id);
    }
}
