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
    
        rgb[0] = (rgb[0] + 85) % 256;
        rgb[1] = (rgb[1] + 170) % 256;
        rgb[2] = (rgb[2] + 255) % 256;

        await phea.transitionColor(rgb, 1000, true);
    
    }

    phea.stop();

}

run();