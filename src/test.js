var state = [0,0,0];

function* getColor(rgb, fr) {
    
    while(fr>0) {
        state[0] = (state[0] + rgb[0]) % 256;
        state[1] = (state[1] + rgb[1]) % 256;
        state[2] = (state[2] + rgb[2]) % 256;
        fr--;
        yield state;
    }

    yield state;

}

function main() {

    let rgb = [10,10,10];

    gen = getColor(rgb, 10);

    while(gen) {
        let message = gen.next();
        if (message.done == true) {
            console.log(message.value);
            console.log("done.");
            break;
        }
        console.log(message.value);
    }

}

main();