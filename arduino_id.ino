// ===============================
// HC-SR04 + LED Smart Bin System
// Arduino UNO R4 WiFi Version
// ===============================

#include <WiFiS3.h>

// Wi-Fi details
char ssid[] = "Tenzin";
char pass[] = "qwertyui";

// Ultrasonic sensor pins
#define trigPin 7
#define echoPin 6

// LED pins
int redLED = 13;
int yellowLED = 12;
int greenLED = 11;

long duration;
int distance;
String binStatus = "";

void setup() {
  Serial.begin(9600);
  while (!Serial);
  
  delay(1000);

  Serial.println("System Started");

  Serial.println("Starting WiFi Connection...");

WiFi.begin(ssid, pass);

while (WiFi.status() != WL_CONNECTED) {
  Serial.println("Connecting to WiFi...");
  delay(1000);
}

Serial.println("");
Serial.println("=================================");
Serial.println("WiFi Connected Successfully!");
Serial.print("Arduino IP Address: ");
Serial.println(WiFi.localIP());
Serial.println("=================================");
delay(5000);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);

  // Connect to Wi-Fi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("WiFi Connected!");
  Serial.print("Arduino IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  // Clear trig pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);

  // Send ultrasonic pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo
  duration = pulseIn(echoPin, HIGH, 30000);

  if (duration == 0) {
    Serial.println("No signal detected");
    delay(500);
    return;
  }

  // Convert to distance in cm
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // LED logic
  if (distance > 0 && distance < 10) {
    binStatus = "FULL";

    digitalWrite(redLED, HIGH);
    digitalWrite(yellowLED, LOW);
    digitalWrite(greenLED, LOW);

  } 
  else if (distance >= 10 && distance < 20) {
    binStatus = "Warning";

    digitalWrite(redLED, LOW);
    digitalWrite(yellowLED, HIGH);
    digitalWrite(greenLED, LOW);

  } 
  else {
    binStatus = "Normal";

    digitalWrite(redLED, LOW);
    digitalWrite(yellowLED, LOW);
    digitalWrite(greenLED, HIGH);
  }

  Serial.print("Status: ");
  Serial.println(binStatus);

  Serial.println("-------------------------");

  delay(500);
}
