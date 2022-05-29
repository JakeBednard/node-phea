const util = require('util');
const RequestPromise = require('request-promise-native');


export namespace HueHttp {

    export async function discoverBridge() {

        // NUPnP

        try {

            let findBridgeRequest = {
                method: 'GET',
                uri: 'https://discovery.meethue.com',
                json: true
            }

            let response = await RequestPromise(findBridgeRequest);

            let bridges: any[] = []
            
            response.forEach((bridge: any) => {
                bridges.push({
                    name: bridge.name,
                    id: bridge.id,
                    ip: bridge.internalipaddress,
                    mac: bridge.macaddress
                })
            });

            return bridges;

        } catch (error:any) {

            switch(error.code) {
                default:
                    break;
            }
        
            throw error;

        }

    }

    export async function registration(ipAddress: string) {

        try {

            let registrationRequest = {
                method: 'POST',
                uri: util.format('http://%s/api/', ipAddress),
                json: true,
                body: {
                    "devicetype":"phea",
                    "generateclientkey":true
                }
            }

            let response = await _hueApiRequest(registrationRequest);

            if (!response[0].success) {
                let error = new Error('No success response recieved from Hue Bridge.');
                //error.code = 'PHEA.HUE_API_CONTROLLER.NO_SUCCESS_RESPONSE_FROM_BRIDGE';
                throw error;
            }

            let credentials = {
                'ip': ipAddress,
                'username': response[0].success.username,
                'psk': response[0].success.clientkey
            }
            
            return credentials;

        } catch (error) {

            /*
            switch(error.code) {
                case 'PHEA.HUE_API_CONTROLLER.BAD_JSON':
                    break;
                case 'PHEA.HUE_API_CONTROLLER.REGISTRATION_INVALID_USERNAME':
                    break;
                case 'PHEA.HUE_API_CONTROLLER.LINK_BUTTON_NOT_PRESSED':
                    break;
                default:
                    break;
            }
        

            logger.error(error);*/
            throw error;

        }

    }

    export async function getGroup(address: string, username: string, groupId: string | number) {

        try {

            let url = util.format('http://%s/api/%s/groups/', address, username);

            if (groupId) { url += groupId.toString(); }
                
            const groupsQuery = {
                method: 'GET',
                uri: url,
                json: true
            }

            const response = await RequestPromise(groupsQuery);

            //if (response[0].error.type == 3) { throw new Error('Group id could not be found for group id:', groupId) }

            return response;

        } catch (error:any) {

            //error.code = 'PHEA.HUE_API_CONTROLLER.GET_GROUP_FAILURE'; 
            throw Error(error);

        }

    }

    export async function setEntertainmentMode(state=true, address: string, username: string, group?: string) {
            
        let setStateQuery = {
            method: 'PUT',
            uri: util.format('http://%s/api/%s/groups/%s', address, username, group),
            json: true,
            body: {'stream': {'active': state}}
        }

        let response = await RequestPromise(setStateQuery);
        let responseKey = '/groups/' + group + '/stream/active';
        
        let dtlsState = response[0]['success'][responseKey];
        
        if (state != dtlsState) {
            throw new Error("PHEA: Hue Bridge DTLS State could not be set.");
        }

    }

    async function _hueApiRequest(request: any) {

        try {

            const response = await RequestPromise(request);

            response.forEach((res: any) => {
                if (res.error) throw _getHueRestError(res.error);
            });

            return response;

        } catch (error) {

            throw error;

        }
    }

    async function _getHueRestError(err: string) {

        let error = new Error(err);

        /*switch(err.type) {
            case 2:
                // Body contains invalid JS
                error.code = 'PHEA.HUE_API_CONTROLLER.BAD_JSON';
                break;
            case 7:
                // Invalid Username
                error.code = 'PHEA.HUE_API_CONTROLLER.REGISTRATION_INVALID_USERNAME';
                break;
            case 101:
                // Link button not pressed.
                error.code = 'PHEA.HUE_API_CONTROLLER.LINK_BUTTON_NOT_PRESSED';
                break;
            default:
                break;
        }*/

        return err;

    }

}
