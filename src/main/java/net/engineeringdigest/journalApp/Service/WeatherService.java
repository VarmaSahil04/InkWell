package net.engineeringdigest.journalApp.Service;

import net.engineeringdigest.journalApp.Service.RedisService;
import net.engineeringdigest.journalApp.api.response.WeatherResponse;
import net.engineeringdigest.journalApp.cache.AppCache;
import net.engineeringdigest.journalApp.constants.PlaceHolders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {
    @Value("${weather.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppCache appCache;

    @Autowired
    private RedisService redisService;

    public WeatherResponse getWeather(String city) {
        WeatherResponse weatherResponse = redisService.get("weather_of_" + city, WeatherResponse.class);
        if (weatherResponse != null) {
            return weatherResponse;
        } else {
            if (appCache.appCache == null || !appCache.appCache.containsKey(AppCache.keys.WEATHER_API.toString()) || apiKey == null || apiKey.isEmpty()) {
                return null;
            }
            try {
                String template = appCache.appCache.get(AppCache.keys.WEATHER_API.toString());
                String finalAPI = template.replace(PlaceHolders.CITY, city).replace(PlaceHolders.API_KEY, apiKey);
                ResponseEntity<WeatherResponse> response = restTemplate.exchange(finalAPI, HttpMethod.POST, null, WeatherResponse.class);
                WeatherResponse body = response.getBody();
                if (body != null) {
                    redisService.set("weather_of_" + city, body, 300L);
                }
                return body;
            } catch (Exception e) {
                return null;
            }
        }

    }
}