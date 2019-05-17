# Node Phea

An unoffcial Phillips Hue Entertainment API library for Node.js. The goal of this library is to encapsulate the Hue Entertainment API while leaving a developer to use a simple color API to control color state... More documentation coming soon, but this is currently working if you already have an entertainment group, username, and psk setup. 

#### Features:
- DTLS Communication Setup + Messaging for Phillips Hue Bridge Entertainment API.
- Single color can be tweaked in real-time and will be reflected throughout entertainment group.
- Controllable update rate (fps).

This is still a work-in-progress. Namely, I have the DTLS Entertainment API working, but there's no implementation
for initial setup. This will have to be done for 1.0. Additionally, error handling will have to be done.

#### To-Do(s):
- Proper Error Handling.
- Guide or library for setting up Hue Entertainment Secrets + Groups.

## Installation:
```
npm install phea
```

## Example:
```javascript
const Phea = require('phea');

let running = true;
process.on("SIGINT", function () {
    // Shut-down demo with ctrl+c
    console.log('SIGINT Detected. Shutting down...');
    running = false;
});

async function run() {

    let config = {
        "ip": "",                // Hue Bridge IP
        "port": 2100,            // Hue Bridge DTLS Port (optional - default 2100) 
        "username": "",          // Hue Entertainment API Username
        "psk": "",               // Hue Entertainment API PSK
        "group": 1,              // Hue Entertainment API Group
        "numberOfLights": 1,     // Number of lights in Hue Entertainment Group [1-16]
        "fps": 50                // FPS (Optional - default 50)
    };

    let phea = new Phea(config);
    
    phea.start();

    while(running) {
    
        phea.red += 85;
        phea.green += 170;
        phea.blue += 255;
    
        await new Promise(r => {
            setTimeout(r, (1000 / (config.fps/2)));
        });
    
    }

    phea.stop();

}

run();
```
