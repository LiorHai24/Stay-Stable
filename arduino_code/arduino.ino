#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>         
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <vector>
#include <Arduino_JSON.h>
#include <string.h>

class Movement{
  private:
      double x;
      double y;
      double z;
  public:
      Movement(double x, double y, double z) {this->x=x;this->y=y;this->z=z;}
      double getX(){return this->x;}
      double getY(){return this->y;}
      double getZ(){return this->z;}
};

class Movements{
  private:
      std::vector<Movement> moves;
      int size;
  
  public:
      Movements(int size=0) {this->size=size;}
      int getSize(){return moves.size();}
      std::vector<Movement> getMoves() {return this->moves;}
      void addMove(Movement& move) {this->moves.push_back(move);}
      void clear(){this->moves.clear();}
};

Adafruit_MPU6050 mpu;
// Set web server port number to 80
WiFiServer server(80);
unsigned long lastTime = 0;
// Set timer to 1 minute (60000)
unsigned long timerDelay = 1000;

void setupMpu();
void checkSettings();
void sendShakingsData(int count);
int analyzeData();

void setupMpu(){
  while (!Serial)
    delay(10); // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("Adafruit MPU6050 test!");

  // Try to initialize!
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
  case MPU6050_RANGE_2_G:
    Serial.println("+-2G");
    break;
  case MPU6050_RANGE_4_G:
    Serial.println("+-4G");
    break;
  case MPU6050_RANGE_8_G:
    Serial.println("+-8G");
    break;
  case MPU6050_RANGE_16_G:
    Serial.println("+-16G");
    break;
  }
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
  case MPU6050_RANGE_250_DEG:
    Serial.println("+- 250 deg/s");
    break;
  case MPU6050_RANGE_500_DEG:
    Serial.println("+- 500 deg/s");
    break;
  case MPU6050_RANGE_1000_DEG:
    Serial.println("+- 1000 deg/s");
    break;
  case MPU6050_RANGE_2000_DEG:
    Serial.println("+- 2000 deg/s");
    break;
  }

  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
  case MPU6050_BAND_260_HZ:
    Serial.println("260 Hz");
    break;
  case MPU6050_BAND_184_HZ:
    Serial.println("184 Hz");
    break;
  case MPU6050_BAND_94_HZ:
    Serial.println("94 Hz");
    break;
  case MPU6050_BAND_44_HZ:
    Serial.println("44 Hz");
    break;
  case MPU6050_BAND_21_HZ:
    Serial.println("21 Hz");
    break;
  case MPU6050_BAND_10_HZ:
    Serial.println("10 Hz");
    break;
  case MPU6050_BAND_5_HZ:
    Serial.println("5 Hz");
    break;
  }

  Serial.println("");
  delay(100);  
}

int analyzeData(){
  return 0;
}

void setup() {
  Serial.begin(115200);

  
  WiFiManager wifiManager;
  wifiManager.autoConnect("AutoConnectAP");
  Serial.println("Connected.");

  server.begin();

  setupMpu();
  Serial.println("starting.....");
}

void sendShakingsData(int count){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:3306/information";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  String payload = "{}"; 
  
  http.addHeader("Content-Type", "application/json");
  char  buffer[1000];
  sprintf(buffer, "{\"count\":%d}", count);
  String httpRequestData = buffer;
  // Send HTTP POST request
  int httpResponseCode = http.PUT(httpRequestData);
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
  WiFiClient client = server.available(); // Listen for incoming clients
  lastTime = millis();  
  Movements moves;
  if (client) {                             // If a new client connects,
    Serial.println("New Client.");          // print a message out in the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) { 
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      Serial.print("Acceleration X: ");
      Serial.print(a.acceleration.x);
      Serial.print(", Y: ");
      Serial.print(a.acceleration.y);
      Serial.print(", Z: ");
      Serial.print(a.acceleration.z);
      //Movement m(a.acceleration.x, a.acceleration.y, a.acceleration.z);
      //moves.addMove(m);
      Serial.print("\n");
      delay(50);           // loop while the client's connected
      if ((millis() - lastTime) > timerDelay) {
          int count = analyzeData();
          sendShakingsData(count);
          lastTime = millis();
      }
      
    }
    client.stop();
    Serial.println("Client disconnected.");
    Serial.println("");
  } 
}