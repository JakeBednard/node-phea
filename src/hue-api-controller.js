const util = require('util');
const log4js = require('@log4js-node/log4js-api');
const RequestPromise = require('request-promise-native');


const logger = log4js.getLogger('PHEA');


module.exports = {
    'registration': registration,
    'getGroup': getGroup
}


async function registration(ipAddress) {

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
            let error = new error('No success response recieved from Hue Bridge.');
            error.code = 'PHEA.HUE_API_CONTROLLER.NO_SUCCESS_RESPONSE_FROM_BRIDGE';
            throw error;
        }

        let credentials = {
            'ip': ipAddress,
            'username': response[0].success.username,
            'psk': response[0].success.clientkey
        }
        
        return credentials;

    } catch (error) {

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
    

        logger.error(error);
        throw error;

    }

}

async function getGroup(groupId, ip, username) {

    try {

        let url = util.format('http://%s/api/%s/groups/', ip, username);

        if (groupId) { url += groupId; }
            
        const groupsQuery = {
            method: 'GET',
            uri: url,
            json: true
        }

        const response = await RequestPromise(groupsQuery);

        //if (response[0].error.type == 3) { throw new Error('Group id could not be found for group id:', groupId) }

        return response;

    } catch (error) {

        error.code = 'PHEA.HUE_API_CONTROLLER.GET_GROUP_FAILURE'; 
        throw Error(error);

    }

}

async function _hueApiRequest(request) {

    try {

        const response = await RequestPromise(request);

        response.forEach((res) => {
            if (res.error) throw _getHueRestError(res.error);
        });

        return response;

    } catch (error) {

        throw error;

    }
}

async function _getHueRestError(err) {

    let error = new Error(err.error);

    switch(err.type) {
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
    }

    return error;

}
