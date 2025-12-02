package com.dapp.backend.enums;

public enum IdentityType {
    ADULT,      // User with full identity documents (CCCD/CMND)
    CHILD,      // Family member under 18, may not have full documents
    NEWBORN     // Just born, no documents yet
}
