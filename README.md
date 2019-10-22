# Node Phea

An unoffcial [Phillips Hue Entertainment API](https://developers.meethue.com/develop/hue-entertainment/) 
Typescript library for Node.js. This package aims to implement the core API functionaility 
of the Entertainment API, while leaving feature implementations to downstream packages. This package
implements a simple RGB-transitition API that is similar to comparable non-Entertainment API packages. 
I've tested with both Linux and Windows and have found the package to be stable. I'm still hammering
out edge-cases and some of the error handling routines, as well as growing with Typescript, so expect
to see some wild code until I have time to test and play with things. As far as support, this is going
to be best effort around real-life. Feel free to pop in an issue or shoot a pull request.


##### Current Version: 1.0.5


#### Features:
- DTLS Communication Setup + Messaging for Phillips Hue Bridge Entertainment API.
- HTTP access to standard Hue API for methods related to Entertainment API functionality (discovery, registration, groups).
- Starting with verison 1.0.0, library is aiming to be Typescript first.
- Multi-light capabilities to tweek/tween lights individually, or all at once.
- Tunable messageing and frame rates to tweak for different environments.


#### To-Do(s):
- Add featuring for creating Hue Entertainment Groups. Currently needs to be setup through Hue app.
- Find a nice way to peacefully end the DTLS socket without throwing. For now, catch it.
- Figure out how to Node/TS testing. Definitely need coverage for user facing API.
- The fancy npm build stuff.
- Continue the full conversion and improvement of library to Typescript.
- Improve Error Handling.

## Getting Started:

### Installation & Import:
```
npm install phea
```
```javascript
const Phea = require('phea');
```

### Discovering Hue Bridges on your network:
```javascript
let bridges = Phea.discover();
console.log(bridges);
```
```javascript
[
  {
    name: undefined,
    id: 'ABCDEF0123456789',
    ip: '192.168.1.152',
    mac: undefined
  }
]
```

### Hue Bridge HTTP/DTLS API key registration:
```javascript
// Press Hue Bridge Link Button Immediately before 
// running Phea.registration(ipAddress: string)
let credentials = Phea.register("192.168.1.152");
console.log(credentials);
```
```javascript
{
  ...
  "username": "_YOUR_HUE_BRIDGE_REGISTRATION_USERNAME_",
  "psk": "_YOUR_HUE_BRIDGE_REGISTRATION_PSK_",
  ...
}
```

### Connecting to the Hue Bridge API:
```javascript
let options = {
    "address": "192.168.1.152",
    "username": "_YOUR_HUE_BRIDGE_REGISTRATION_USERNAME_",
    "psk": "_YOUR_HUE_BRIDGE_REGISTRATION_PSK_"
}

let bridge = Phea.bridge(options);
```

### Fetch Hue Bridge Groups:
```javascript
let groups = await bridge.getGroup(0); // 0 will fetch all groups.
console.log(groups);
```
```javascript
[  
  // "1" is the id for the light group. You must use group w/ type: 'Entertainment',
  "1": { 
    name: 'Entertainment area 1',
    lights: [ '1', '2', ... ],
    sensors: [],
    type: 'Entertainment',
    state: { all_on: true, any_on: true },
    recycle: false,
    class: 'TV',
    stream: {...},
    locations: {...}
    action: {...}
  }, 
  ...
]
```

### Starting/Stopping PHEA DTLS Light Control:
```javascript
bridge.start(entertainmentGroupId);

// ...Light Control Stuff

bridge.stop();
```

### Light Control:
```javascript
let lightId = [0];         // 0 is the Default Group for setting all lights in group.
let rgb = [255, 255, 255]; // RGB int array [r, g, b]
let transitionTime = 1000; // Milliseconds

bridge.transition(lightId, rgb, transitionTime);
```

### Full Examples
*Please see the examples directory for full examples and demonstrations.*

## API Documentation

### Phea:

#### Phea.discover(): Promise<`any`>
Returns an array containing details for all Phillips Hue Bridge's found on
network using Hue Public API (NUPnP). If HTTP traffic isn't allowed to egress your
network to the web, this isn't going to return anything.

#### Phea.register(ipAddress: string): Promise<`any`>
##### Make sure to press the Hue Bridge Link button before runnning this method.
Returns an unqiue username and psk from the Hue Bridge. These credentials are used
to access the bridge's HTTP and DTLS APIs.

#### Phea.bridge(options: Options): Promise<`HueBridge`>
Creates and returns a HueBridge object that will be used for interacting with
the HueBridge. The HueBridge object is essentially the controller for fetching from the
HueAPI as well as controls the PheaEngine object to orchestrate light control.

#### Phea Bridge Options (User Config Dictionary):
```Typescript
export interface Options {
  address: string;
  username: string;
  psk: string;
  dtlsUpdatesPerSecond: number;
  colorUpdatesPerSecond: number;
  dtlsPort: number;
  dtlsTimeoutMs: number;
}
```
The creation of this object sets up the bridge control ecosystem for Phea. The main parts of this ecosystem are the Hue Bridge
controller and the lights which maintain transition math. The core is called the Phea Engine where we strap all the parts 
together. The Phea Engine is then interacted with using the bridge controller object.

Params:

##### address (string) [required]:
The IPv4 address or host address of the Hue Bridge that will be serving the Entertainment API.

##### username (string) [required]:
Required: The 40-character string generated by the Hue Bridge server. You'll typically have to set this up manually through 
the Bridge's REST API. In the future, the goal is the automate this generation in to the app itself. 

##### psk (string) [required]:
Required: The 32-character hex string generated by the Hue Bridge server. You'll typically have to set this up manually through 
the Bridge's REST API. In the future, the goal is the automate this generation in to the app itself. 

##### colorUpdatesPerSecond (int) [default=25]:
This value controls the update rate of light color transition controller. By default, this value is set to
60, which is the recomended max rate by Philips (dtlsUpdateRate/2). Keep in mind, the lights themselves are limited to about 12.5fps in
real life, so that'll be your ultimate cap of light performance. 

##### dtlsUpdatesPerSecond (int) [default=50]:
This value controls the update rate of color change events to the Entertainment API. By default, this value is set to
60, which is the recomended max rate by Philips. Keep in mind, the lights themselves are limited to about 12.5fps in
real life, so that'll be your ultimate cap of light performance. The upside to this limit is that gives you somewhere in 
between 20-80ms to generate your next color. 

##### dtlsPort (int) [default=2100]:
The Hue Bridge port listening for commands. Default is for the Hue Bridge is 2100.

##### dtlsTimeoutMs (int) [default=100]:
Timeout in milliseconds to wait when connecting to the Hue Brdige DTLS port. Currently
this value will always be used on connection creation to delay for dtls socket creation
race condition (TODO: Fix race condition).


### HueBridge:

#### Bridge.start(groupId: string | int) : promise<`void`>
This opens the DTLS socket with the Hue Bridge, then kicks the rendering loop into action. groupId is Hue Entertainment
group API that you wish to control as int or string. While the engine is
hidden behind the API, the engine itself is always throwing renders to the Bridge every (1000/dtlsUpdatesPerSecond) milliseconds. 
This is done to keep the light completely in-sync as well as maintain an open connection with the Bridge. This returns
a promise waiting for the establishment of the socket to the Bridge. You should wait for this to happen before any
other communication happens.

#### Bridge.stop() : promise<`void`>
Shut it all down, exit the render loops, release the socket. Sometime a frame can hang and it'll take a second or two to 
fully return. I'm looking into this, but its a minor inconvienence.

#### Bridge.transition(lightId: (string | int)[], rgb: int[], transitionTime: int) : promise<`void`>
Phea color changes are facilated through the transition method. Every color change, on every light, consist of a interval 
loop to handle the math of updating and rendering colors for each respective light. These interval loops can be interrupted and
replaced at any point, even immediately. This allows transitions to be set in real-time to control the lights. Keep in mind, 
even if tween time is set to 0, you'll still ultimately be limited by the dtlsTimeoutMs option ~(1000/dtlsTimeoutMs) milliseconds.

##### lightId: (string | int)[]:
The light channels to send this color transition to. The value 0 selects all of the lights (options.numberofLights).
One distinction with this API is that light channel input numbers, numbering starts at 0, where as, the Hue Bridge starts
numbering at 1. So when placing your lights channels, recall n-1, to place the value. 

##### rgb: int[] = [0,0,0]:
This is the color the you want the transition the selected lights to. This is a 3-value array where each value is a 
uint8 representing the red, green, blue color bytes respectively. This color will be tweened to over the duration of
tweenTime.

##### transitionTime: int = 0:
This is the amount of time in milliseconds that the transition will take to tween from the existing color to
the new color. Default is 0, which means that the color change will occur on the next update to the Hue Bridge.
I don't see any performance concerns yet, but I'm trying to start finding ways to do profiling. Though, with an update
rate at 50fps, you're still looking at 15-20ms to render you're next color setting. That it typlically ample, and if not,
the framerate can be lowered to accomodate.

#### Bridge.getGroup(groupId: string | int) : promise<`any`>
Fetches group information from Hue HTTP API. groupId can be int or string. If 0 is provided, all groups will be returned.
Note, when all groups are fetched, an array will be returned.

#### Bridge.setGroup(groupId: string | int, groupSettings: any) : promise<`void`>
-NOT IMPLEMENTED-

#### Bridge.getLight(groupId: string | int) : promise<`any`>
-NOT IMPLEMENTED-

## Photosensitive Seizure Warning
###### (via Phillips Hue Documentation)
A very small percentage of people may experience a seizure when exposed to certain visual images, including flashing lights or patterns that may appear in video games. Even people who have no history of seizures or epilepsy may have an undiagnosed condition that can cause these “photosensitive epileptic seizures” while watching video with the additional light effects.These seizures may have a variety of symptoms, including lightheadedness, altered vision, eye or face twitching, jerking or shaking of arms or legs, disorientation, confusion, or momentary loss of awareness. Seizures may also cause loss of consciousness or convulsions that can lead to injury from falling down or striking nearby objects. Immediately stop project participation and consult a doctor if you experience any of these symptoms. Parents should watch for or ask their children about the above symptoms. Children and teenagers are more likely than adults to experience these seizures. The risk of photosensitive epileptic seizures may be reduced by taking the following precautions:

- Use it in a well-lit room
- Do not use it if you are drowsy or fatigued
- If you or any of your relatives have a history of seizures or epilepsy, consult a doctor before participation.
