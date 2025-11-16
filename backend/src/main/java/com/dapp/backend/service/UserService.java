package com.dapp.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import com.dapp.backend.dto.mapper.UserMapper;
import com.dapp.backend.dto.request.UserRequest;
import com.dapp.backend.dto.response.DoctorResponse;
import com.dapp.backend.dto.response.UserResponse;
import com.dapp.backend.service.spec.UserSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.User;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AuthService authService;
    private final UserRepository userRepository;

    public Pagination getAllDoctorsOfCenter(Specification<User> specification, Pageable pageable) throws AppException {
        User user = authService.getCurrentUserLogin();
        specification = Specification.where(specification).and(UserSpecifications.findByRole()).and(UserSpecifications.findByCenter(user.getCenter().getName()));
        specification = Specification.where(specification).and(UserSpecifications.findByRole());
        Page<User> page = userRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());
        pagination.setMeta(meta);
        List<DoctorResponse> list = page.getContent().stream()
                .map(UserMapper::toResponse).collect(Collectors.toList());

        pagination.setResult(list);

        return pagination;
    }

    public Pagination getAllUsers(Specification<User> specification, Pageable pageable) {
        Page<User> pageUser = userRepository.findAll(specification, pageable);
        Pagination pagination = new Pagination();
        Pagination.Meta meta = new Pagination.Meta();
        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(pageUser.getTotalPages());
        meta.setTotal(pageUser.getTotalElements());
        pagination.setMeta(meta);

        // Use the new comprehensive mapper
        List<UserResponse> listUsers = pageUser.getContent().stream()
                .map(UserMapper::toUserResponse)
                .collect(Collectors.toList());

        pagination.setResult(listUsers);
        return pagination;
    }

    public UserResponse updateUser(UserRequest request) throws AppException {
        User user = userRepository.findById(request.getId()).orElseThrow(() -> new AppException("User not found"));

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());

        // Use the new comprehensive mapper
        return UserMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(long id) throws AppException {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException("User not found"));
        user.setDeleted(true);
        userRepository.save(user);
    }

}
