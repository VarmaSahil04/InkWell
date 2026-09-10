package net.engineeringdigest.journalApp.Service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.JournalEntry;
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.repository.JournalEntryRepo;
import org.bson.types.ObjectId;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.*;


@Service
@Slf4j
public class JournalEntryServices {



    @Autowired
    private JournalEntryRepo journalEntryRepository; // Dependency Injection

    @Autowired
    private UserService userService;



    @Transactional
    public void saveEntry(JournalEntry journalEntry, String userName){
       try{
           User user = userService.findByUserName(userName);
           journalEntry.setDate(LocalDateTime.now());
           JournalEntry saved = journalEntryRepository.save(journalEntry);
           user.getJournalEntries().add(saved);
           userService.saveNewEntry(user);
       }catch(Exception e){

           throw new RuntimeException("An Error occurred while saving the entry :",e);
       }
    }
    public void saveEntry(JournalEntry journalEntry){

     journalEntryRepository.save(journalEntry);

    }

    public List<JournalEntry> getALL(){
        return journalEntryRepository.findAll();
    }

    public Optional<JournalEntry> findById(ObjectId id){
        return journalEntryRepository.findById(id);
    }

    @Transactional
    public boolean DelById(ObjectId id, String userName){
        boolean removed = false;
       try{
           User user = userService.findByUserName(userName);
            removed = user.getJournalEntries().removeIf( x -> x.getId().equals(id));
           if(removed){
               userService.saveNewEntry(user); // Updated user
               journalEntryRepository.deleteById(id);
           }

       }catch(Exception e){
          log.error("Error",e);
           throw new RuntimeException("An error occurred while deleting the entry:"+e);
       }
        return removed;
    }


}

