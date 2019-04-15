#include <AltSoftSerial.h>
//Netwerk
String AP = "Delta";       // CHANGE ME
String PASS = "D3ltah0k"; // CHANGE ME
//Hostnaam (kan ip zijn) + poort
String HOST = "192.168.1.104";
String PORT = "3000";
String URI = "/";
String data = "rood=0blauw=5000"; 

boolean goingToConnect = false;
AltSoftSerial esp;

void setup() {
  Serial.begin(9600);
  esp.begin(9600);
  delay(2000);
  testESP();


  //  esp.println(F("AT+  RST"));
  //  if(esp.find("OK") ) Serial.println("ESP reset");
}
void testESP() {
  Serial.println("command: AT");
  esp.println("AT");
  delay(500);
  if (waitForResponse("OK\r\n", 10000))
  {
    Serial.println("ESP8266 module works!");
    delay(2000);
    reset();
  } else {
    Serial.println("ESP8266 not working");
    delay(2000);
    testESP();
  }
}
void reset() {
  Serial.println("command: AT+RST");
  esp.println("AT+RST");
  delay(500);
  if (waitForResponse("OK\r\n", 10000))
  {
    
    Serial.println("ESP8266 module reset!");
    espInfo();
    setCipMux();
  } else {
    Serial.println("ESP8266 error");
    delay(1000);
    reset();
  }
}
void connectToWifi() {
  Serial.println("Command: AT+CWMODE?");
  esp.println("AT+CWMODE?");
  delay(500);
  if (waitForResponse("1\r\n", 10000))
  {
    Serial.println("CWMODE = 1");
    goingToConnect = true;
    Serial.println("Command: AT+CWJAP=\"" + AP + "\",\"" + PASS + "\"");
    esp.println("AT+CWJAP=\"" + AP + "\",\"" + PASS + "\"");
    delay(500);
    if (waitForResponse("OK\r\n", 10000))
    {
      Serial.println("Connected to wifi!");
      espInfo();
      delay(1000);
      espInfo();
    } else {
      Serial.println("ESP8266 error");
      delay(1000);
      connectToWifi();
    }
  } else {
    setCWMode();
  }
}

void setCWMode() {
  Serial.println("Command: AT+CWMODE?");
  esp.println("AT+CWMODE?");
  delay(500);
  if (waitForResponse("1\r\n", 10000))
  {
    Serial.println("CWMODE = 1");
  } else {
    espInfo();
    Serial.println("Command: AT+CWMODE=1");
    esp.println("AT+CWMODE=1");
    delay(500);
    if (waitForResponse("OK\r\n", 10000))
    {
      espInfo();
      connectToWifi();
    } else {
      Serial.println("ESP8266 error");
      espInfo();
      delay(3000);
      setCWMode();
    }
  }
}

void setCipMux(){
  Serial.println("Command: AT+CIPMUX?");
  esp.println("AT+CIPMUX?");
  delay(500);
  if (waitForResponse("0\r\n", 10000))
  {
    Serial.println("CIPMUX mode = 0");
    delay(2000);
    connectToWifi();
  } else {
    Serial.println("Command: AT+CIPMUX=0");
    espInfo();
    esp.println("AT+CIPMUX=0");
    delay(500);
    if (waitForResponse("OK\r\n", 10000)){
      
      Serial.println("CIPMUX mode = 0");
      delay(2000);
      connectToWifi();
    } else{
      Serial.println("ESP8266 error");
      delay(2000);
      setCipMux(); 
    }
  }
}
void connectToServer() {
  checkWifi();
  delay(1000);
  Serial.println("Command: AT+CIPSTART=0,\"TCP\",\"192.168.1.104\",3000");
  esp.println("AT+CIPSTART=\"TCP\",\"192.168.1.104\",3000");
  delay(500);
  if (waitForResponse("OK\r\n", 10000))
  {
    Serial.println("ESP8266 Connected to server!");
  } else {
    Serial.println("ESP8266 error");
    espInfo();
    connectToServer();
  }
}

void disconnectToWifi() {
  delay(1000);
  Serial.println("Command: AT+CIPCLOSE");
  esp.println("AT+CIPCLOSE");
  delay(500);
  if (waitForResponse("OK\r\n", 10000))
  {
    Serial.println("ESP8266 disconnected from server!");
  } else {
    Serial.println("ESP8266 error");
    espInfo();
    delay(1000);
  }
}

void checkWifi(){
  espInfo();
  Serial.println("Command: AT+CWJAP?");
  esp.println("AT+CWJAP?");
  delay(500);
  if (waitForResponse("OK\r\n", 10000))
  {
    Serial.println("OK");
    espInfo();
  } else {
    Serial.println("ESP8266 No OK");
    espInfo();
    connectToWifi();
  }

}

void postData () {
  connectToServer();
  Serial.println("Send Postdata");
  espInfo();
  String postRequest =
    "POST " + URI + " HTTP/1.1\r\n" +
    "Host: " + HOST + ":" + PORT + "?\r\n" +
    "Accept: *" + "/" + "*\r\n" +
    "Content-Length: " + data.length() + "\r\n" +
    "Content-Type: application/x-www-form-urlencoded\r\n" +
    "\r\n" + data;
  String sendCmd = "AT+CIPSEND=";//determine the number of caracters to be sent.
  Serial.println(sendCmd);
  Serial.println(postRequest.length());
  esp.println(sendCmd + postRequest.length());
  delay(5000);
  if (waitForResponse("OK\r\n", 10000)){
    Serial.println("Sending.."); 
    esp.print(postRequest);
    delay(5000);
    if (waitForResponse("OK\r\n", 10000)){
       Serial.println("Data send");
    }
    espInfo();
  } else if (waitForResponse("ERROR\r\n", 10000)){
    Serial.println("esp Error");
  }
  else {
    Serial.println("Seems to be an error?");
  }
  disconnectToWifi();
}
void loop() {
  
  postData();
  delay(12000);
}

void espInfo(){
  int startTime = millis();
  String responseBuffer;
  char charIn;
  while ((millis() - startTime) < 4000)
  {
    if (esp.available())
    {
      charIn = esp.read();
      responseBuffer += charIn;

    }
  }
  Serial.println(responseBuffer);
  esp.flush();
}
//--------- check for response fucntion
boolean waitForResponse(String target, int timeout)
{
  int startTime = millis();
  String responseBuffer;
  char charIn;

  //keep checking for ESP response until timeout expires
  while ((millis() - startTime) < timeout)
  {
    if (esp.available())
    {
      charIn = esp.read();
      responseBuffer += charIn;

    }
    if (responseBuffer.endsWith(target))
    {
      return 1; //true
    }
  }
  if ((responseBuffer.indexOf("DISCONNECT") > 0) && (goingToConnect == true))
  {
    Serial.println(responseBuffer);
    Serial.println("Disconnected - trying to connect to wifi again");
    connectToWifi();
  }
  if ((responseBuffer.indexOf("No AP") > 0) && (goingToConnect == true))
  {
    Serial.println(responseBuffer);
    Serial.println("Disconnected - trying to connect to wifi again");
    connectToWifi();
  }
  else if (!responseBuffer.endsWith(target))
  {
    Serial.println(responseBuffer);
    return 0; //false
  }
}
