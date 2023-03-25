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


String ids = WiFi.macAddress();
const char* id = ids.c_str();


 const int MPU_addr = 0x68; // I2C address of the MPU-6050
 int16_t AcX, AcY, AcZ, Tmp, GyX, GyY, GyZ;
 float ax = 0, ay = 0, az = 0, gx = 0, gy = 0, gz = 0;
 boolean fall = false; //stores if a fall has occurred
 boolean trigger1 = false; //stores if first trigger (lower threshold) has occurred
 boolean trigger2 = false; //stores if second trigger (upper threshold) has occurred
 boolean trigger3 = false; //stores if third trigger (orientation change) has occurred
 byte trigger1count = 0; //stores the counts past since trigger 1 was set true
 byte trigger2count = 0; //stores the counts past since trigger 2 was set true
 byte trigger3count = 0; //stores the counts past since trigger 3 was set true
 int angleChange = 0;

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

Movements* moves = new Movements();

String convertMoves(){
  std::vector<Movement> myMoves = moves->getMoves();
  String ret = "[";

  for(Movement move:myMoves){
    char arr[50];
    String temp;
    sprintf(arr, "[%f,%f,%f]", move.getX(), move.getY(), move.getZ());
    temp = arr;
    ret += temp + ',';
  }
  ret.remove(ret.length()-1);
  ret += "]";
  return ret;
}


Adafruit_MPU6050 mpu;
// Set web server port number to 80
WiFiServer server(80);
unsigned long lastTimeTimer = 0;
unsigned long lastTimeCheck = 0;
// Set timer to 1 minute (60000)
unsigned long timerDelay = 2000;
unsigned long checkDelay = 1000;
void mpu_read();
void setupMpu();
void checkSettings();
bool sendShakingsData();
int analyzeData();
void sendMpuStatus();


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

  //setupMpu();

  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0);     // set to zero (wakes up the MPU-6050)
  Wire.endTransmission(true);
  Serial.println("Wrote to IMU");

  Serial.println("starting.....");
}

bool checkStatus(){
  byte error, address;
  int nDevices;
 
  Serial.println("Scanning...");
 
  nDevices = 0;
  for(address = 1; address < 127; address++ )
  {
    // The i2c_scanner uses the return value of
    // the Write.endTransmisstion to see if
    // a device did acknowledge to the address.
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
 
    if (error == 0)
    {
      Serial.print("I2C device found at address 0x");
      if (address<16)
        Serial.print("0");
      Serial.print(address,HEX);
      Serial.println("  !");
 
      nDevices++;
    }
    else if (error==4)
    {
      Serial.print("Unknown error at address 0x");
      if (address<16)
        Serial.print("0");
      Serial.println(address,HEX);
      nDevices--;
    }    
  }
  if (nDevices <= 0)
    return false;
  return true;
}

void sendCheckStatus(bool check){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:3306/check_connection";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  String payload = "{}"; 
  
  http.addHeader("Content-Type", "application/json");
  char  buffer[20];
  sprintf(buffer, "{\"mac\":%s, \"status\"", id, int(check));
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

void sendFallRequest(bool check){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:3306/alert";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  String payload = "{}"; 
  
  http.addHeader("Content-Type", "application/json");
  char  buffer[20];
  sprintf(buffer, "{\"mac\":%s", id);
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


void sendFallRequest(){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:3306/alert";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());

  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

  String payload = "{}"; 
  
  http.addHeader("Content-Type", "application/json");
  char  buffer[1000];
  sprintf(buffer, "{\"mac\":%s", id);
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

bool sendShakingsData(){
  WiFiClient client;
  HTTPClient http;
  String serverPath = "http://10.100.102.2:3306/information";
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverPath.c_str());
  // If you need Node-RED/server authentication, insert user and password below
  //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");
  String payload = "{}"; 
  
  http.addHeader("Content-Type", "application/json");
  
  char  buffer[10000];
  String s = convertMoves();
  sprintf(buffer, "{\"mac\":\"%s\", \"vibrations\":%s}", id, s.c_str());
  String httpRequestData = buffer;
  http.addHeader("Content-Length", String(httpRequestData.length()));
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
    return false;
  }
  Serial.println(payload);
  JSONVar myObject = JSON.parse(payload);
  
  // JSON.typeof(jsonVar) can be used to get the type of the var
  if (JSON.typeof(myObject) == "undefined") {
    return false;
  }
    
  Serial.print("JSON object = ");
  Serial.println(myObject);
    
  // myObject.keys() can be used to get an array of all the keys in the object
  JSONVar keys = myObject.keys();
  JSONVar errorMsg = myObject[keys[0]];
  JSONVar result = myObject[keys[1]];
  Serial.print("error message = ");
  Serial.println(errorMsg);
  return true;
}

void checkFalling(){
    mpu_read();
    ax = (AcX - 2050) / 16384.00;
    ay = (AcY - 77) / 16384.00;
    az = (AcZ - 1947) / 16384.00;
    gx = (GyX + 270) / 131.07;
    gy = (GyY - 351) / 131.07;
    gz = (GyZ + 136) / 131.07;
    float Raw_Amp = pow(pow(ax, 2) + pow(ay, 2) + pow(az, 2), 0.5);
    int Amp = Raw_Amp * 10;  // Mulitiplied by 10 bcz values are between 0 to 1
    Serial.println(Amp);

    if (Amp <= 2 && trigger2 == false) { //if AM breaks lower threshold (0.4g)     
      trigger1 = true;     
      Serial.println("TRIGGER 1 ACTIVATED");   
    }   

    if (trigger1 == true) {     
      trigger1count++;     
      if (Amp >= 12) { //if AM breaks upper threshold (3g)
        trigger2 = true;
        Serial.println("TRIGGER 2 ACTIVATED");
        trigger1 = false; trigger1count = 0;
      }
    }
    
    if (trigger2 == true) {
      trigger2count++;
      angleChange = pow(pow(gx, 2) + pow(gy, 2) + pow(gz, 2), 0.5); Serial.println(angleChange);
      if (angleChange >= 30 && angleChange <= 400) { //if orientation changes by between 80-100 degrees       
        trigger3 = true; trigger2 = false; trigger2count = 0;       
        Serial.println(angleChange);       
        Serial.println("TRIGGER 3 ACTIVATED");     
      }   
    } 

    if (trigger3 == true) {     
      trigger3count++;     
      if (trigger3count >= 10) {
        angleChange = pow(pow(gx, 2) + pow(gy, 2) + pow(gz, 2), 0.5);
        //delay(10);
        Serial.println(angleChange);
        if ((angleChange >= 0) && (angleChange <= 10)) { //if orientation changes remains between 0-10 degrees         
          fall = true; trigger3 = false; 
          trigger3count = 0;         
          Serial.println(angleChange);       
        }       
        else { //user regained normal orientation         
          trigger3 = false; trigger3count = 0;         
          Serial.println("TRIGGER 3 DEACTIVATED");       
        }     
      }   
    } 

    if (fall == true) { //in event of a fall detection     
      Serial.println("FALL DETECTED");
      sendFallRequest();     
      fall = false;   
    }   
    if (trigger2count >= 6) { //allow 0.5s for orientation change
      trigger2 = false; trigger2count = 0;
      Serial.println("TRIGGER 2 DECACTIVATED");
    }
    if (trigger1count >= 6) { //allow 0.5s for AM to break upper threshold
      trigger1 = false; trigger1count = 0;
      Serial.println("TRIGGER 1 DECACTIVATED");
    }
    delay(100);

}

void sendResponse(){
  String header;
  WiFiClient client = server.available(); // Listen for incoming clients
  header = "";
  String currentLine = "";                // make a String to hold incoming data from the client
  if(client){
    Serial.println("New Client."); // print a message out in the serial port
    while (client.connected()) { 
      if (client.available()) {                           // If a new client connects,
                    
          char c = client.read();             // read a byte, then
          Serial.write(c);                    // print it out the serial monitor
          header += c;
          if (c == '\n') {                    // if the byte is a newline character
            // if the current line is blank, you got two newline characters in a row.
            // that's the end of the client HTTP request, so send a response:
            if (currentLine.length() == 0) {
              // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
              // and a content-type so the client knows what's coming, then a blank line:
              client.println("HTTP/1.1 200 OK");
              client.println("Content-type:text/html");
              client.println();
              
              if (header.indexOf("GET /MAC") >= 0) {
                client.println(id);
              }
              client.stop();
              Serial.println("Client disconnected.");
              Serial.println("");
            } else { // if you got a newline, then clear currentLine
              currentLine = "";
            }
          } else if (c != '\r') {  // if you got anything else but a carriage return character,
            currentLine += c;      // add it to the end of the currentLine
          }
        }
      }
    // Clear the header variable
  } 
}

void receiveMovement(){
    checkFalling();
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    /*
    Serial.print("Acceleration X: ");
    Serial.print(a.acceleration.x);
    Serial.print(", Y: ");
    Serial.print(a.acceleration.y);
    Serial.print(", Z: ");
    Serial.print(a.acceleration.z);
    Serial.println();
    */
    Movement m(a.acceleration.x, a.acceleration.y, a.acceleration.z);
    moves->addMove(m);
}

void mpu_read() {
   Wire.beginTransmission(MPU_addr);
   Wire.write(0x3B);  // starting with register 0x3B (ACCEL_XOUT_H)
   Wire.endTransmission(false);
   Wire.requestFrom(MPU_addr, 14, true); // request a total of 14 registers
   AcX = Wire.read() << 8 | Wire.read(); // 0x3B (ACCEL_XOUT_H) & 0x3C (ACCEL_XOUT_L)
   AcY = Wire.read() << 8 | Wire.read(); // 0x3D (ACCEL_YOUT_H) & 0x3E (ACCEL_YOUT_L)
   AcZ = Wire.read() << 8 | Wire.read(); // 0x3F (ACCEL_ZOUT_H) & 0x40 (ACCEL_ZOUT_L)
   Tmp = Wire.read() << 8 | Wire.read(); // 0x41 (TEMP_OUT_H) & 0x42 (TEMP_OUT_L)
   GyX = Wire.read() << 8 | Wire.read(); // 0x43 (GYRO_XOUT_H) & 0x44 (GYRO_XOUT_L)
   GyY = Wire.read() << 8 | Wire.read(); // 0x45 (GYRO_YOUT_H) & 0x46 (GYRO_YOUT_L)
   GyZ = Wire.read() << 8 | Wire.read(); // 0x47 (GYRO_ZOUT_H) & 0x48 (GYRO_ZOUT_L)
}

void loop() {
  bool sent = false;
  sendResponse();
  bool check = checkStatus();
  if ((millis() - lastTimeCheck) > checkDelay) {
    sendCheckStatus(check);
    lastTimeCheck = millis();
  }
  if(check){
    receiveMovement();
    delay(100);
    Serial.println();
    if ((millis() - lastTimeTimer) > timerDelay) {
      sent = sendShakingsData();
      if(sent){
        moves->clear();   
        lastTimeTimer = millis();      
      }
    }    
  }
}

