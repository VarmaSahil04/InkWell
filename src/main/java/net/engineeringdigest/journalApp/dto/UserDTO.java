package net.engineeringdigest.journalApp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class UserDTO {
    @NotEmpty
    @Schema(description =  "Enter user Name")
    private String userName;
    private String email;
    private String sentimentAnalysis;
    @NotEmpty
    @Schema(description = "user's password")
    private String password;
}
