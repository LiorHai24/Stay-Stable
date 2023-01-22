int sensoroutput = A1;
int ledoutput = 12;
int thresehold = 90;
int i = 0;


void setup() {
  pinMode(ledoutput, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  
  int value = analogRead(sensoroutput);
  if(value >= thresehold){
    	digitalWrite(ledoutput, HIGH);
    	delay(10);
      //Serial.print(i, HEX);
      //i = i + 1;
  }
  else{
    	digitalWrite(ledoutput, LOW);
    	delay(10);
  }
  
}