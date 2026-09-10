package net.engineeringdigest.journalApp.entity;


import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private ObjectId id; // linked id with mongoDb id

    @Indexed(unique = true)
    @NonNull
    private String userName; // It should be unique
    @NonNull
    private String password;
    private String email;
    private boolean sentimentAnalysis;



    @DBRef  // Creating Ref of Journal Entries in Users
    private List<JournalEntry> journalEntries = new ArrayList<>(); // Acting as Foreign Key
    private List<String> roles; // admin and users

    // =========================================================================
    // MODIFICATION: Added by Antigravity for Password Reset via Brevo
    // =========================================================================
    private String resetToken;
    private java.time.LocalDateTime resetTokenExpiry;
}
