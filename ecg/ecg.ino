// const int ECG_PIN = A0;
// const int LO_PLUS = 10;
// const int LO_MINUS = 11;
// // const int SDN = 9;   // optional

// void setup() {
//   Serial.begin(9600);

//   pinMode(LO_PLUS, INPUT);
//   pinMode(LO_MINUS, INPUT);

//   // Optional SDN control
//   // pinMode(SDN, OUTPUT);
//   // digitalWrite(SDN, LOW);
// }

// void loop() {
//   if (digitalRead(LO_PLUS) == HIGH || digitalRead(LO_MINUS) == HIGH) {
//     Serial.println("!");
//   } 
//   else {
//     int ecgValue = analogRead(ECG_PIN);
//     Serial.println(ecgValue);
//   }
//   delay(2);   // better sampling for ECG
// }
#define LO_PLUS 10
#define LO_MINUS 11

void setup() {
  Serial.begin(9600);
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
}

void loop() {
  if (digitalRead(LO_PLUS) == 1 || digitalRead(LO_MINUS) == 1) {
    Serial.println("!");
  } else {
    int ecg = analogRead(A0);
    Serial.println(ecg);
  }
  delay(15);
}

