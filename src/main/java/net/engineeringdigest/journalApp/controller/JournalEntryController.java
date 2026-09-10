package net.engineeringdigest.journalApp.controller;

import net.engineeringdigest.journalApp.entity.JournalEntry;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/_journal")
public class JournalEntryController {

    private Map<Long , JournalEntry> journalentriers = new HashMap<>();

    @GetMapping
    public List<JournalEntry> getAll(){ // localhost:8080/journal GET
     return new ArrayList<>(journalentriers.values());
    }

    @PostMapping
    public boolean createEntry(@RequestBody  JournalEntry myEntry){ // localhost:8080/journal POST
        // journalentriers.put(myEntry.getId(), myEntry);
         return true;
    }

    @GetMapping("/id/{myId}")
    public JournalEntry getJournalEntryById(@PathVariable Long myId)
    {
       return journalentriers.get(myId);

    }

    @DeleteMapping("id/{myId}")
    public JournalEntry deleteEntryById(@PathVariable Long myId){
        return  journalentriers.remove(myId);
    }


    @PutMapping("id/{myId}")
    public JournalEntry updateEntryById(@PathVariable Long myId , @RequestBody JournalEntry updatedEntry){
        return journalentriers.put(myId,updatedEntry);
    }
}
