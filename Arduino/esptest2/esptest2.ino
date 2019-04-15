#include <SPI.h>
#include <SoftwareSerial.h>
#include <stdlib.h>
#include <ArduinoJson.h>

SoftwareSerial ser(10, 11);// RX, TX



void setup() { 
  Serial.begin(9600);
  ser.begin(115200);
  ser.println("AT+RST");
}

void loop(){

  ser.println("AT+CIPSTART=\"TCP\",\" 192.168.2.96\",3000");

  if(ser.find((char*)"Error")){
  Serial.println("AT+CIPSTART error");
  return;
  }

  // prepare GET string
  String getStr = "POST /arduino/esp.php?temp=200";
//  getStr += "temp=20";
//  getStr += "\r\n\r\n";
//GET /arduino/esp.php?temp=30\r\n\r\n
  Serial.println(getStr);
  // send data length
  String cmd = "AT+CIPSEND=";
  cmd += String(getStr.length());
  ser.println(cmd);
  Serial.println(cmd);

  if(ser.find((char*)">")){
    ser.print(getStr);
    Serial.println("Message sent!");
  }
  else{
  ser.println("AT+CIPCLOSE");
  // alert user
  Serial.println("AT+CIPCLOSE");
  }

  delay(1000); // WAIT FIVE MINUTES BEFORE SENDING AGAIN
