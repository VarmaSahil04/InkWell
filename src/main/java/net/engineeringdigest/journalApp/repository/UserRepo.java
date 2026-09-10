package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface UserRepo extends MongoRepository<User, ObjectId> {

    User findByUserName(String username);

    void deleteByUserName(String userName);

    // =========================================================================
    // MODIFICATION: Added by Antigravity for Password Reset via Brevo
    // =========================================================================
    User findByEmail(String email);

    User findByResetToken(String resetToken);
}
