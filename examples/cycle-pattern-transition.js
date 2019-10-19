const Phea = require('phea');

let running = true;
process.on("SIGINT", () => {
    // Stop example with ctrl+c
    console.log('SIGINT Detected. Shutting down...');
    running = false;
});

async function cyclePatternTransition() {

    let options = {
        "address": "__YOUR_BRIDGE_ADDRESS__",
        "username": "__YOUR_USERNAME__",
        "psk": "__YOUR_PSK__",
        "dtlsUpdatesPerSecond": 50,
        "colorUpdatesPerSecond": 60 // Found these FPS settings to work nicely.
    }

    let groupId = 2;
    let transitionTime = 1000; // milliseconds

    let colors = [
        [0, 180, 180], 
        [0, 128, 255], 
        [0, 0, 255], 
        [64, 0, 255],
        [127, 0, 255],
        [64, 0, 255],
        [0, 0, 255], 
        [0, 128, 255]
    ]

    let bridge = await Phea.bridge(options);
    let numberOfLights = await bridge.getGroup(groupId).lights.length;
    
    await bridge.start(groupId);

    let i = 0;
    while(running) {

        for(let id=0; i<numberOfLights; i++) {
            bridge.transition(id+1, colors[(i+id) % colors.length], transitionTime);
        }
        
        await new Promise(resolve => setTimeout(resolve, transitionTime));

        i += 1;

    }

    bridge.stop();

}

cyclePatternTransition();