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
    let tweenTime = 1000;
    
    await phea.start();

    phea.texture(lights=[], type='sine', duration=2000, depth=40);

    while(running) {
    
        rgb[0] = (rgb[0] + 85) % 256;
        rgb[1] = (rgb[1] + 170) % 256;
        rgb[2] = (rgb[2] + 255) % 256;

        await phea.transition(lights=[], rgb=rgb, tweenTime=tweenTime, block=true);
    
    }

    phea.stop();

}

run();