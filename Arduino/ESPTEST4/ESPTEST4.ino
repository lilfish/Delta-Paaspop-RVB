#include "ESP8266.h"
#include <SoftwareSerial.h>

SoftwareSerial mySerial(8, 9); /* RX:D3, TX:D2 */
ESP8266 wifi(mySerial);

String AP = "Delta";
String PASSWORD = "D3ltah0k";


String HOST = "192.168.1.108";
String PORT = "3000";
String TCP_HOST = "192.168.1.108";
uint32_t TCP_PORT = 3000;

char POST_URI = "/give_data";

int working = 0;
uint32_t len;

String response;
boolean alive = true;

int rood = 500;
int blauw = 500;

void setup() {
  Serial.begin(9600);
  Serial.println("-- Start --");
  
  Serial.println("Calling ESP...  ");
  if(wifi.kick() == 1) Serial.println("ESP live"); else { Serial.println(" [FAIL]"); }
  
  Serial.println("Calling reset....  ");
  if(wifi.restart() == 1) Serial.println("ESP Restarted"); else { Serial.println(" [FAIL]"); working++; }
  
  Serial.println("Calling Station mode...  ");
  if(wifi.setOprToStation() == 1) Serial.println("ESP set to setOprToStation mode"); else { Serial.println(" [FAIL]"); working++; }
  
  Serial.println("\"Network: " + AP + "\"");
  Serial.println("Connecting to network...  ");
  if(wifi.joinAP(AP, PASSWORD) == 1) Serial.println("ESP Connected to \"" + AP + "\" network."); else { Serial.println(" [FAIL]"); working++; }
  
  Serial.println("Calling Ip status...  "); 
  if (wifi.getIPStatus() != "") Serial.println(wifi.getIPStatus()); else { Serial.println(" [FAIL]"); working++; }
  
  Serial.println("Calling local Ip...  "); 
  if (wifi.getLocalIP() != "") Serial.println(wifi.getLocalIP()); else { Serial.println(" [FAIL]"); working++; }
  
  Serial.println("Calling MUX mode...  ");
  if(wifi.disableMUX() == 1) Serial.println("ESP set to single connection mode"); else { Serial.println(" [FAIL]"); working++; }
  
  delay(2000);
  if (working == 0) Serial.println("starting with loop"); else { Serial.println("errors: " + working); stoppedWorking(working); }
  
}

void loop() {
  String http = "POST /give_data HTTP/1.1\r\nHost: ";
  http += HOST;
  http += ":";
  http += PORT;
  http += "\r\nrood:";
  http += rood;
  http += "\r\nblauw:";
  http += blauw;
  http += "\r\nConnection: close\r\n\r\n";
  
  if (wifi.createTCP(TCP_HOST, TCP_PORT)) {
    sendData(http);
   } else {
      Serial.print("TCP connect error\r\n");
  }
  Serial.println("delay 2000");
  delay(2000);
}

void sendData(String data){
  String Response;
  char charresponse[15];
  
  char myarray[data.length()];
  data.toCharArray(myarray, data.length());
  
    if (wifi.send((const uint8_t*)myarray, data.length())){
      uint8_t buffer[15] = {0};
      uint32_t len = wifi.recv(buffer, sizeof(buffer), 20000);
      if (len > 0) {
          for(uint32_t i = 0; i < len; i++) {
              charresponse[i]=(char)buffer[i];
          }
          Response=String(charresponse);
      } else {
          Response="Error";
      }
      if(Response.indexOf("OK") > 0){
        Serial.println(Response);
        alive = true;
      } else {
        Serial.println("Error!");
        Serial.println(Response);
        alive = false;
      }
    }
 
}

void stoppedWorking(int times){
  int x;
  Serial.println("Show red light ");
  Serial.print(times);
  Serial.print(" times.");
  Serial.println("");
  for (x = 0; x < times; x ++) {
    Serial.print(x);
  }
  while(true){
    
  }
}

