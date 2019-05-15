const Phea = require('./phea');

let config = {
    "ip": "",                // Hue Bridge IP
    "port": 2100,            // Hue Bridge DTLS Port (optional - default 2100) 
    "username": "",          // Hue Entertainment API Username
    "psk": "",               // Hue Entertainment API PSK
    "group": 1,              // Hue Entertainment API Group
    "numberOfLights": 1,     // Number of lights in Hue Entertainment Group [1-16]
    "fps": 50                // FPS (Optional - default 50)
};

let running = true;

process.on("SIGINT", function () {
    console.log('SIGINT Detected. Shutting down...');
    running = false;
});

async function run() {

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