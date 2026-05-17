#include <WiFiS3.h>
#include <ArduinoHttpClient.h>

// =======================
// WiFi
// =======================
char ssid[] = "Tenzin";
char pass[] = "qwertyui";

// =======================
// Firebase
// =======================
char serverAddress[] = "smart-bin-system-71b37-default-rtdb.firebaseio.com";
int port = 443;

WiFiSSLClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);

// =======================
// Sensor Pins
// =======================
#define trigPin 7
#define echoPin 6

// =======================
// LED Pins
// =======================
int redLED = 13;
int yellowLED = 12;
int greenLED = 11;

// =======================
// Variables
// =======================
long duration;
int distance;
String binStatus;

void setup() {

  Serial.begin(9600);

  // Sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // LEDs
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);

  Serial.println("-------------------------");
  Serial.println("System Started");

  // =======================
  // Connect WiFi
  // =======================
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    Serial.print(".");
    delay(2000);
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("Arduino IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {

  // =======================
  // Ultrasonic Sensor
  // =======================

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);

  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // =======================
  // Bin Status
  // =======================

if (distance <= 10) {
  binStatus = "Critical";
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
}
else if (distance > 10 && distance <= 25) {
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

  // =======================
  // Send Firebase Data
  // =======================

  sendToFirebase();

  Serial.println("-------------------------");

  delay(5000);
}

// =======================
// Firebase Function
// =======================

void sendToFirebase() {

  String jsonData = "{";
  jsonData += "\"binId\":\"BIN-101\",\n";
  jsonData += "\"distance\":" + String(distance) + ",\n";
  jsonData += "\"status\":\"" + binStatus + "\",\n";
  jsonData += "\"location\":\"Room 101\"\n";
  jsonData += "}";

  Serial.println("Sending data to Firebase...");
  Serial.println(jsonData);

  client.put("/smartbin.json", "application/json", jsonData);

  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  Serial.print("Firebase Status Code: ");
  Serial.println(statusCode);

  Serial.print("Firebase Response: ");
  Serial.println(response);
}
