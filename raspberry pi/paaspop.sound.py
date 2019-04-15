import pyttsx3
import sounddevice as sd
import soundfile as sf
import os

def play(file_path):
    data, fs = sf.read(file_path)
    sd.play(data, fs)
    sd.wait() 

engine = pyttsx3.init()
voices = engine.getProperty('voices')
for voice in voices:
    print (voice.name)
    if voice.name == u'eSpeak-NL-NL':
        engine.setProperty('voice', voice.id)
        break

engine.say('Hoi davey hoe is het?')
engine.runAndWait()


play("all_points.wav")


engine.say('Hoi eawklfjklaewjfklewjkawfe')
engine.runAndWait()