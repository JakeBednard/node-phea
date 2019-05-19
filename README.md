# Node Phea

An unoffcial [Phillips Hue Entertainment API](https://developers.meethue.com/develop/hue-entertainment/) library for Node.js. The goal of this library is to encapsulate the Hue Entertainment API while leaving a developer to use a simple color API to control color state... More documentation coming soon, but this is currently working if you already have an entertainment group, username, and psk setup. 

#### Features:
- DTLS Communication Setup + Messaging for Phillips Hue Bridge Entertainment API.
- Single color can be tweaked in real-time and will be reflected throughout entertainment group.
- Controllable update rate (fps).

This is still a work-in-progress. Namely, I have the DTLS Entertainment API working, but there's no implementation
for initial setup. Additionally, error handling will have to be done.

1.0 is planned to have support for multilight in some form. Until then, I plan on keeping the mainline API the same. 

#### To-Do(s):
- Proper Error Handling.
- Guide or library for setting up Hue Entertainment Secrets + Groups.

## Installation:
```
npm install phea
```

## Basic Example:
```javascript
const Phea = require('phea');

let running = true;
process.on("SIGINT", function () {
    // Stop example with ctrl+c
    console.log('SIGINT Detected. Shutting down...');
    running = false;
});

async function run() {

    let config = {
        "ip": "192.168.1.10",
        "port": 2100,
        "username": "",
        "psk": "",
        "group": 1,
        "numberOfLights": 1,
        "fps": 50
    }

    let phea = new Phea(config);
    let rgb = [0,0,0];
    
    await phea.start();

    while(running) {
    
        // Manipulate color state
        rgb[0] = (rgb[0] + 85) % 256;
        rgb[1] = (rgb[1] + 170) % 256;
        rgb[2] = (rgb[2] + 255) % 256;

        // Transition to the new color over 1000 ms. Wait until then.
        await phea.transitionColor(rgb, 1000, true);
    
    }

    phea.stop();

}

run();
```

## Photosensitive Seizure Warning
###### (via Phillips Hue Documentation)
A very small percentage of people may experience a seizure when exposed to certain visual images, including flashing lights or patterns that may appear in video games. Even people who have no history of seizures or epilepsy may have an undiagnosed condition that can cause these “photosensitive epileptic seizures” while watching video with the additional light effects.These seizures may have a variety of symptoms, including lightheadedness, altered vision, eye or face twitching, jerking or shaking of arms or legs, disorientation, confusion, or momentary loss of awareness. Seizures may also cause loss of consciousness or convulsions that can lead to injury from falling down or striking nearby objects. Immediately stop project participation and consult a doctor if you experience any of these symptoms. Parents should watch for or ask their children about the above symptoms. Children and teenagers are more likely than adults to experience these seizures. The risk of photosensitive epileptic seizures may be reduced by taking the following precautions:

- Use it in a well-lit room
- Do not use it if you are drowsy or fatigued
- If you or any of your relatives have a history of seizures or epilepsy, consult a doctor before participation.
