const Phea = require('phea');

let running = true;
process.on("SIGINT", () => {
    // Stop example with ctrl+c
    console.log('SIGINT Detected. Shutting down...');
    running = false;
});

async function basicExample() {

    let options = {
        "address": "__YOUR_BRIDGE_ADDRESS__",
        "username": "__YOUR_USERNAME__",
        "psk": "__YOUR_PSK__",
    }

    let groupId = 2;
    let transitionTime = 1000; // milliseconds

    let bridge = await Phea.bridge(options);    
    await bridge.start(groupId);

    while(running) {

        let color = [
            // Generate Random RGB Color Array
            Math.floor(55 + Math.random() * Math.floor(200)),
            Math.floor(55 + Math.random() * Math.floor(200)),
            Math.floor(55 + Math.random() * Math.floor(200))
        ];

        // Set all lights to random color.
        bridge.transition(0, color, transitionTime);
        
        // Sleep until next color update is needed.
        await new Promise(resolve => setTimeout(resolve, transitionTime));

    }

    bridge.stop();

}

basicExample();