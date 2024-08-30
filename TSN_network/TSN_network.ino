#define CONNECTION_POOL 240
#define NODE_POOL 16

// Define a struct to hold the configuration for each CD4051B
struct CD4051BConfig {
  int enPin;
  int comPin;
  const int channels[4];  // channelA, channelB, channelC, channelD
};

// Initialize a CD4051BConfig instance
CD4051BConfig mux0 = { 2, 3, { 4, 5, 6, 7 } };
CD4051BConfig mux1 = { 8, A0, { 10, 11, 12, 13 } };

struct NodeConnection {
  int node0;
  int node1;
};

NodeConnection* connections;

void setup() {
  // Init Serial USB
  Serial.begin(115200);
  Serial.println(F("Initialize System"));

  // Init CD4051B
  for (int i = 0; i < 4; i++) {
    pinMode(mux0.channels[i], OUTPUT);
    digitalWrite(mux0.channels[i], LOW);
    pinMode(mux1.channels[i], OUTPUT);
    digitalWrite(mux1.channels[i], LOW);
  }

  // Enable mux
  pinMode(mux0.enPin, OUTPUT);
  digitalWrite(mux0.enPin, LOW);
  pinMode(mux1.enPin, OUTPUT);
  digitalWrite(mux1.enPin, LOW);

  // Set COM mode

  pinMode(mux0.comPin, OUTPUT);
  pinMode(mux1.comPin, INPUT_PULLUP);

  connections = (NodeConnection*)malloc(CONNECTION_POOL * sizeof(NodeConnection));
}

int a, b, i, r, connectionCount;


void loop() {
  connectionCount = 0;
  for (a = 0; a < 16; a++) {
    for (b = 0; b < 16; b++) {
      r = checkConnection(a, b);
      if (r) {
        connections[connectionCount].node0 = a;
        connections[connectionCount].node1 = b;
        connectionCount++;

        analogWrite(mux0.comPin, 128);
        pinMode(mux1.comPin, OUTPUT);
        digitalWrite(mux1.comPin, HIGH);
        delay(100);
        pinMode(mux1.comPin, INPUT_PULLUP);
      }
    }
  }

  Serial.print(F("["));
  int I;
  for (I = 0; I < connectionCount; I++) {
    Serial.print(F("{"));
    Serial.print(F("\"0\": "));
    Serial.print(connections[I].node0);
    Serial.print(F(", \"1\": "));
    Serial.print(connections[I].node1);
    Serial.print(F("}"));
    if (I < connectionCount - 1) {
      Serial.print(F(", "));
    }
  }
  Serial.println(F("]"));

  delay(100);
}

void selectChannel(CD4051BConfig mux, int chnl) {
  for (int i = 0; i < 4; i++) {
    digitalWrite(mux.channels[i], bitRead(chnl, i));
  }
}

void writeChannel(CD4051BConfig mux, int chnl, char lev) {
  selectChannel(mux, chnl);
  digitalWrite(mux.comPin, lev);
}

int readChannel(CD4051BConfig mux, int chnl) {
  selectChannel(mux, chnl);
  int read = analogRead(mux.comPin);
  
  return read < 400;
}

int checkConnection(int node0, int node1) {
  writeChannel(mux0, node0, LOW);
  int res = readChannel(mux1, node1);

  return res;
}
