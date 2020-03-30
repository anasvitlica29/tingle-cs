package com.tingle.tingle.domain;

import com.tingle.tingle.domain.enums.Role;

import javax.persistence.*;
import java.io.Serializable;

@Entity
public class Certificate implements Serializable {



    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="serialNumber", unique = true)
    private String serialNumber;

    @Column(name="alias", unique = true)
    private String alias;

    @Column(nullable = false)
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(name="certificateRole", nullable = false)
    private Role certificateRole;

    public Certificate() {}

    public Certificate(Long id, String serialNumber, String alias, boolean active, Role role) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.alias = alias;
        this.active = active;
        this.certificateRole = role;
    }

    public Role getCertificateRole() {
        return certificateRole;
    }

    public void setCertificateRole(Role certificateRole) {
        this.certificateRole = certificateRole;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}