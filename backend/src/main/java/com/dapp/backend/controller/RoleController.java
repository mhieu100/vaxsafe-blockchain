package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.Role;
import com.dapp.backend.service.RoleService;
import com.turkraft.springfilter.boot.Filter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/roles")
    @ApiMessage("Get all roles")
    public ResponseEntity<Pagination> getRoles(
            @Filter Specification<Role> spec, Pageable pageable) {
        return ResponseEntity.ok(this.roleService.getRoles(spec, pageable));
    }

    @GetMapping("/roles/{id}")
    @ApiMessage("Get a role by id")
    public ResponseEntity<Role> getRole(@PathVariable long id) throws AppException {
        Role role = this.roleService.fetchById(id);
        if (role == null) {
            throw new AppException("Role với id = " + id + " không tồn tại");
        }
        return ResponseEntity.ok(role);
    }

    @PutMapping("/roles/{id}")
    @ApiMessage("Update a role")
    public ResponseEntity<Role> updateRole(@PathVariable long id ,@Valid @RequestBody Role role) throws AppException {
        if (this.roleService.fetchById(id) == null) {
            throw new AppException("Role với id = " + role.getId() + " không tồn tại");
        }
        return ResponseEntity.ok().body(this.roleService.updateRole(id ,role));
    }

}
