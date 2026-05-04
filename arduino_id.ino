// ===============================
// HC-SR04 + LED Smart Bin System (Improved)
// ===============================

#define trigPin 9
#define echoPin 10

int redLED = 7;
int yellowLED = 6;
int greenLED = 5;

long duration;
int distance;

void setup() {
  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {

  // Clear trig pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);

  // Send pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo with timeout (VERY IMPORTANT)
  duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout

  // If no reading
  if (duration == 0) {
    Serial.println("No signal");
    return;
  }

  // Convert to distance
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // LED logic
  if (distance > 0 && distance < 10) {
    Serial.println("Status: Bin FULL");

    digitalWrite(redLED, HIGH);
    digitalWrite(yellowLED, LOW);
    digitalWrite(greenLED, LOW);

  } 
  else if (distance >= 10 && distance < 20) {
    Serial.println("Status: Bin Almost Full");

    digitalWrite(redLED, LOW);
    digitalWrite(yellowLED, HIGH);
    digitalWrite(greenLED, LOW);

  } 
  else {
    Serial.println("Status: Bin Empty");

    digitalWrite(redLED, LOW);
    digitalWrite(yellowLED, LOW);
    digitalWrite(greenLED, HIGH);
  }

  Serial.println("-------------------------");

  delay(500);
}