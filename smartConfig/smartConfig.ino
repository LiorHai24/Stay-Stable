#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* serverUrl = "http://10.100.102.2:9583/stack/size";


void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);

  // Start the SmartConfig process
  WiFi.beginSmartConfig();

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    Serial.println(WiFi.smartConfigDone());
  }
  // Connected to wifi network
  Serial.println("Connected to wifi network");
}

void loop() {
  // Verify wifi connection
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("Not connected to wifi network");
    return;
  }

  // Send a GET request to the server
  HTTPClient http;
  WiFiClient wifiClient;
  http.begin(wifiClient, serverUrl);

  int httpCode = http.GET();

  // Check for the response
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println(payload);
  } else {
    Serial.println("Error sending GET request");
  }

  http.end();

  delay(5000);
}