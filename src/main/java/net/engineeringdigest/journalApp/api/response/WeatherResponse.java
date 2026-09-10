package net.engineeringdigest.journalApp.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class WeatherResponse {

    private Current current;


     @Getter
     @Setter
    public class Current {

        private String observation_time;
        private int temperature;
        private int feelslike;
        private ArrayList<String> weather_icons;
        private ArrayList<String> weather_descriptions;
    }
}
