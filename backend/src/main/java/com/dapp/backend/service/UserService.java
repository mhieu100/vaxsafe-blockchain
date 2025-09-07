package com.dapp.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.dapp.backend.dto.request.ReqUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.User;
import com.dapp.backend.dto.response.Pagination;
import com.dapp.backend.dto.response.ResUser;
import com.dapp.backend.repository.CenterRepository;
import com.dapp.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CenterRepository centerRepository;

    public Optional<User> getUserByWalletAddress(String walletAddress) throws AppException {
        Optional<User> user = userRepository.findByWalletAddress(walletAddress);
        if(user.isPresent()) {
        return user;

        }
        throw new AppException("User Not Found");
    }

    public ResUser convertToResUser(User user) {
        ResUser resUser = new ResUser();
        resUser.setWalletAddress(user.getWalletAddress());
        resUser.setFullname(user.getFullName());
        resUser.setEmail(user.getEmail());
        resUser.setPhoneNumber(user.getPhoneNumber());
        resUser.setBirthday(user.getBirthday());
        resUser.setAddress(user.getAddress());
        if (user.getCenter() == null) {
            resUser.setCenterName(null);
        } else {
            resUser.setCenterName(user.getCenter().getName());
        }
        resUser.setRoleName(user.getRole().getName());
        return resUser;
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

        List<ResUser> listUsers = pageUser.getContent().stream()
                .map(this::convertToResUser).collect(Collectors.toList());

        pagination.setResult(listUsers);

        return pagination;
    }

    public ResUser updateUser(String walletAddress, ReqUser reqUser) throws AppException {
        Optional<User> currentUser = userRepository.findByWalletAddress(walletAddress);
        if (currentUser.isEmpty()) {
            throw new AppException("User not found with wallet address: " + walletAddress);
        }
        currentUser.get().setEmail(reqUser.getEmail());
        currentUser.get().setFullName(reqUser.getFullName());
        currentUser.get().setPhoneNumber(reqUser.getPhoneNumber());
        currentUser.get().setBirthday(reqUser.getBirthday());
        currentUser.get().setAddress(reqUser.getAddress());
        if (reqUser.getCenterName() != null) {
            currentUser.get().setCenter(this.centerRepository.findByName(reqUser.getCenterName()));
        }
        return convertToResUser(userRepository.save(currentUser.get()));

    }

    public void deleteUser(String walletAddress) throws AppException {
        Optional<User> currentUser = userRepository.findByWalletAddress(walletAddress);
        if (currentUser.isEmpty()) {
            throw new AppException("User not found with wallet address: " + walletAddress);
        }
        currentUser.get().setDeleted(true);
        userRepository.save(currentUser.get());
    }

}
