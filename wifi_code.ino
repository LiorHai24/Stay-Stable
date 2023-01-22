/*
  Rui Santos
  Complete project details at Complete project details at https://RandomNerdTutorials.com/esp8266-nodemcu-http-get-post-arduino/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
  Code compatible with ESP8266 Boards Version 3.0.0 or above 
  (see in Tools > Boards > Boards Manager > ESP8266)
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <Arduino_JSON.h>

const char* ssid = "Bakva";
const char* password = "0525200554";

//Your Domain name with URL path or IP address with path
//String serverName = "http://192.168.1.106:1880/update-sensor";

// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastTime = 0;
// Timer set to 10 minutes (600000)
//unsigned long timerDelay = 600000;
// Set timer to 1 seconds (1000)
unsigned long timerDelay = 1000;

void setup() {
  Serial.begin(115200); 

  WiFi.mode(WIFI_STA);

  // Start the SmartConfig process
  WiFi.beginSmartConfig();
  Serial.println("Connecting");
  while (!WiFi.smartConfigDone()) {
    delay(500);
    Serial.println("Waiting for SmartConfig to complete...");
  }
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
 
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
}

void httpGetRequest() {
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:9583/stack/size";
  // Your IP address with path or Domain name with URL path 
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  // Send HTTP POST request
  int httpResponseCode = http.GET();

  String payload = "{}"; 

  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    return;
  }
  
  
  // Free resources
  http.end();
  Serial.println(payload);
  JSONVar myObject = JSON.parse(payload);
  
  // JSON.typeof(jsonVar) can be used to get the type of the var
  if (JSON.typeof(myObject) == "undefined") {
    Serial.println("Parsing input failed!");
    return;
  }
    
  Serial.print("JSON object = ");
  Serial.println(myObject);
    
  // myObject.keys() can be used to get an array of all the keys in the object
  JSONVar keys = myObject.keys();
  JSONVar errorMsg = myObject[keys[0]];
  JSONVar result = myObject[keys[1]];
  Serial.print("error message = ");
  Serial.println(errorMsg);
  Serial.print("result = ");
  Serial.println(int(result));
}

void httpPostRequest(){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:9583/independent/calculate";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  String payload = "{}"; 
  
  // Specify content-type header
  http.addHeader("Content-Type", "application/json");

  // Data to send with HTTP POST
  String httpRequestData = "{\"arguments\":[1,2],\"operation\":\"Plus\"}";

  // Send HTTP POST request
  int httpResponseCode = http.POST(httpRequestData);
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    return;
  }
  Serial.println(payload);
  JSONVar myObject = JSON.parse(payload);
  
  // JSON.typeof(jsonVar) can be used to get the type of the var
  if (JSON.typeof(myObject) == "undefined") {
    Serial.println("Parsing input failed!");
    return;
  }
    
  Serial.print("JSON object = ");
  Serial.println(myObject);
    
  // myObject.keys() can be used to get an array of all the keys in the object
  JSONVar keys = myObject.keys();
  JSONVar errorMsg = myObject[keys[0]];
  JSONVar result = myObject[keys[1]];
  Serial.print("error message = ");
  Serial.println(errorMsg);
  Serial.print("result = ");
  Serial.println(int(result));
}

void loop() {
  // Send an HTTP POST request depending on timerDelay
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      // http handaling json body in response
      // httpGetRequest();
      httpPostRequest();
   
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}