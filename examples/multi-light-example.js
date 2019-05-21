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
    
    await phea.start();

    await phea.transitionColor(lights=[], rgb=[0,0,0], 100);

    let tween = 5000;
    while(running) {

        for(let i=0; i<config.numberOfLights; i++) {
            await phea.transitionColor(lights=[i], rgb=randomColor(120, 230), tween);
        }

        await sleep(tween);
    
    }

    phea.stop();

}

function randomColor(min=0, max=255) {
    return [
        min + Math.floor(Math.random() * Math.floor(max-min)),
        min + Math.floor(Math.random() * Math.floor(max-min)),
        min + Math.floor(Math.random() * Math.floor(max-min)),
    ];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

run();