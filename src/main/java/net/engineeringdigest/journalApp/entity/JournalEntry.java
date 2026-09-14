package net.engineeringdigest.journalApp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.*;
import net.engineeringdigest.journalApp.constants.Sentiment;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.*;


@Document(collection = "journal_entries")
@Data
@NoArgsConstructor // used for decentralization
public class JournalEntry {

    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;

    @NonNull
    private String title;

    @JsonProperty("content")
    private String Content;

    private LocalDateTime date;
    private Sentiment sentiment;



}
