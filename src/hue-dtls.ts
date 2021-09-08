import { Buffer } from 'buffer';
import { dtls } from "node-dtls-client";
import { LightState } from "./phea-light-state";


export namespace HueDtls {

    export async function createSocket(address: string, username: string, psk: string, timeout: number, port: number):Promise<dtls.Socket> {
        return new Promise((resolve, reject) => {
            
            let socket:dtls.Socket;
    
            let config = {
                type: "udp4",
                port: port,
                address: address,
                psk: { [username]: Buffer.from(psk, 'hex') },
                cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
                timeout: timeout
            }
    
            // @ts-ignore
            socket = dtls.createSocket(config);
            socket.on("message", (msg: string) => { 
    
            })
            .on("error", (e: any) => { 
                reject(e);
            })

            .on("close", () => {  
                reject("DTLS socket closed");
            })

            .on("connected", () => {  
                resolve(socket);
            });
        })

    }

    export function createMessage(lights: LightState[]) : Buffer {

        lights.forEach((light) => {
            if (light.color.length > 3) {
                throw new Error("Phea: Malformed Color Array for DTLS Message.");
            }
            for(let i=0; i<3; i++) {
                let colorInt = light.color[i];
                if (!Number.isInteger(colorInt) || colorInt < 0 || colorInt > 255) {
                    throw new Error(
                        "Phea: Color Array for DTLS Message must be integer[][] representing RGB values 0->255."
                    );
                }
            }
        })

        // Init temp array with 'HueStream' as bytes for protocol type definition
        const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
        
        tempBuffer.push(0x01);                              // Major Version
        tempBuffer.push(0x00);                              // Minor Version
        tempBuffer.push(0x00);                              // Sequence Number
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Color Mode RGB
        tempBuffer.push(0x00);                              // Reserved          

        lights.forEach(light => {                           // For each light in group...
            tempBuffer.push(0x00);                          // Light Type Designation
            tempBuffer.push(0x00);                          // Light n ID (16-bit)
            tempBuffer.push(Number(light.lightId));         // (STILL NOT ACCOUNTING FOR 16-BIT IDs)
            tempBuffer.push(Math.round(light.color[0]));    // Light n Red (16-bit) 
            tempBuffer.push(Math.round(light.color[0]));    //  
            tempBuffer.push(Math.round(light.color[1]));    // Light n Green (16-bit) 
            tempBuffer.push(Math.round(light.color[1]));    // 
            tempBuffer.push(Math.round(light.color[2]));    // Light n Blue (16-bit) 
            tempBuffer.push(Math.round(light.color[2]));    // 
        });

        return Buffer.from(tempBuffer);

    }

}
