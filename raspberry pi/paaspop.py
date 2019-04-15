import pyttsx3
import sounddevice as sd
import soundfile as sf
import os
import requests 
import RPi.GPIO as GPIO
import time
import asyncio

# reset GPIO pins
GPIO.cleanup()

# Host url (moet http:// hebben)
URL = "http://192.168.1.139:3000/rasp_kewstie"
POST_URL = "http://192.168.1.139:3000/give_data"
#GPIO config
GPIO.setwarnings(False) # Ignore warning for now
GPIO.setmode(GPIO.BOARD) # Use physical pin numbering
GPIO.setup(10, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Set pin 10 to be an input pin and set initial value to be pulled low (off)
GPIO.setup(12, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# rood en blauw integers om op te tellen
rood = 0
blauw = 0

# timers
timer = 290
timer2 = 50

#een functie om een rood lichtje aan te zetten op het moment dat er iets miss gaat.
def redLight():
    print("RED LIGHT")

# Audio file afspelen
def play(file_path):
    data, fs = sf.read(file_path)
    sd.play(data, fs)
    sd.wait() 

# functie om de kwestie op te halen via de URL
def krijgKwestie():
    try:
        r = requests.get(url = URL) 
        data = r.json() 
        return data
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        print(e)
        return False

# vertsuur de int rood & blauw naar de server in de body
def verstuurInfo():
    global rood
    global blauw
    print("Verstuur info functie")
    print("rood: " + str(rood))
    print("blauw: " + str(blauw))
    try:
        r = requests.post(POST_URL, data = {'rood':rood, 'blauw':blauw})

        # als de server niet met 200 reageerd, is er iets mis en laten branden we een rood lampje
        if not "200" in str(r):
            redLight()
        else:
            rood = 0
            blauw = 0
    except requests.exceptions.RequestException as e:  # This is the correct syntax
        print(e)

# functie om de omroep te starten
def omroep():
    print("Omroep functie")
    # Init de engine en zet properties
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    
    # engine.setProperty('voice', 'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\eSpeak_3')
    engine.setProperty('rate', 120)
    for voice in voices:
            if voice.name == u'dutch':
                print("Dutch found")
                engine.setProperty('voice', voice.id)
                break

    # krijg de kwestie
    data = krijgKwestie()
    if not data == False:
    
        
        # Start met eerste wav file
        play("recordings/Recording (3).wav")

        # zeg de kwestie
        engine.say(data['kwestie'])
        engine.runAndWait()

        # speel tweede wav file
        play("recordings/Recording (4).wav")

        # zeg rood-antwoord
        engine.say(data['rood_vraag'])
        engine.runAndWait()

        # speel derde wav file
        play("recordings/Recording (5).wav")

        # zeg blauw-antwoord
        engine.say(data['blauw_vraag'])
        engine.runAndWait()

        # speel laatste wav file
        play("recordings/Recording (6).wav")
    else:
        engine.say("Geen connectie met de server! Schakel hulp in!")
        engine.runAndWait()

async def timeFueledFunctie():
    global timer
    global timer2

    while True:
        if timer2 == 60:
            verstuurInfo()
            timer2 = 0
        if timer == 300:
            omroep()
            timer = 0
        timer += 1
        timer2 += 1
        time.sleep(1)

def button_callback(channel):
    global rood
    global timer
    rood += 1
    if timer < 280:
        timer = 280
    print("red!")

def button_callback2(channel):
    global blauw
    global timer
    blauw += 1

    if timer < 280:
        timer = 280
    print("blue!")

GPIO.add_event_detect(10,GPIO.RISING,callback=button_callback) # Setup event on pin 10 rising edge
GPIO.add_event_detect(12,GPIO.RISING,callback=button_callback2)

while True:
    # getVotes()
    loop = asyncio.get_event_loop()
    task = loop.create_task(timeFueledFunctie())
    loop.run_until_complete(task)

gp.cleanup()
