import { Options } from "./phea-options"
import { HueBridge } from "./hue-bridge";
import { HueHttp } from "./hue-http";
import { Config } from "./phea-config";


export async function discover(): Promise<any> {
    let bridges = await HueHttp.discoverBridge();
    return bridges;
}

export async function register(ipAddress: string): Promise<any> {
    let credentials = await HueHttp.registration(ipAddress);
    return credentials;
}

export async function bridge(options: Options): Promise<HueBridge> {
    configureBridgeOptions(options);
    let bridge = new HueBridge(options);
    return bridge; 
}

export function configureBridgeOptions(options: Options): void {

    // Check if opts is null or not dictionary (Mandatory)
    if (options == null || typeof(options) !== 'object') throw new Error(
        "PHEA: No (or incorrect) configuration dictionary object given. Please see documented examples."
    );

    // Host Address (Mandatory)
    if (typeof(options.address) !== 'string') throw new Error(
        "PHEA: 'options.address' type invalid or unspecified. 'address' must be a string containing IP in IPv4 format or domain. Can contain port."
    );

    // Username (Mandatory)
    if (typeof(options.username) !== 'string') throw new Error(
        "PHEA: 'options.username' type invalid or unspecified. Must be string."
    );

    // PSK (Mandatory)
    if (typeof(options.psk) !== 'string') throw new Error(
        "PHEA: 'options.psk' type invalid or unspecified. Must be string."
    );

    // DTLS Updates Per Second (Optional)
    if (options.dtlsUpdatesPerSecond == null) {
        options.dtlsUpdatesPerSecond = Config.DTLS_UPDATES_PER_SECOND;
    }
    else if (
            typeof(options.dtlsUpdatesPerSecond) !== 'number' || 
            options.dtlsUpdatesPerSecond < Config.DTLS_UPDATES_PER_SECOND_MIN || 
            options.dtlsUpdatesPerSecond > Config.DTLS_UPDATES_PER_SECOND_MAX 
    ) {
        throw new Error(
            "PHEA: 'options.dtlsUpdatesPerSecond' must be of type int between " + 
            Config.DTLS_UPDATES_PER_SECOND_MIN + " and " + Config.DTLS_UPDATES_PER_SECOND_MAX + " inclusive."
        )
    }

    // Color Updates Per Second (Optional)
    if (options.colorUpdatesPerSecond == null) {
        options.colorUpdatesPerSecond = Config.COLOR_UPDATES_PER_SECOND;
    }
    else if (typeof(options.colorUpdatesPerSecond) !== 'number' || 
        options.colorUpdatesPerSecond < Config.COLOR_UPDATES_PER_SECOND_MIN || 
        options.colorUpdatesPerSecond > Config.COLOR_UPDATES_PER_SECOND_MAX) {
        throw new Error(
            "PHEA: 'colorUpdatesPerSecond' must be of type int between " + 
            Config.COLOR_UPDATES_PER_SECOND_MIN + " and " + Config.COLOR_UPDATES_PER_SECOND_MAX + " inclusive."
        )
    }

    // dtlsPort (Optional)
    if (options.dtlsPort == null) {
        options.dtlsPort = Config.DTLS_PORT;
    }
    else if (typeof(options.dtlsPort) !== 'number' || options.dtlsPort < Config.DTLS_PORT_MIN || 
        options.dtlsPort > Config.DTLS_PORT_MAX) {
        throw new Error(
            "PHEA: 'dtlsPort' must be of type int between " + 
            Config.DTLS_PORT_MIN + " and " + Config.DTLS_PORT_MAX + " inclusive."
        )
    }

    // dtlsTimeout (Optional)
    if (options.dtlsTimeoutMs == null) {
        options.dtlsTimeoutMs = Config.DTLS_TIMEOUT;
    }
    else if (typeof(options.dtlsTimeoutMs) !== 'number' || options.dtlsTimeoutMs < Config.DTLS_TIMEOUT_MIN || 
        options.dtlsTimeoutMs > Config.DTLS_TIMEOUT_MAX) {
        throw new Error(
            "PHEA: 'dtlsTimeout' must be of type int between " + 
            Config.DTLS_TIMEOUT_MIN + " and " + Config.DTLS_TIMEOUT_MAX + " inclusive."
        )
    }

    // dtlsListenPort (Optional)
    if (options.dtlsListenPort == null) {
        options.dtlsListenPort = Config.DTLS_PORT;
    }
    else if (typeof(options.dtlsListenPort) !== 'number' || options.dtlsListenPort < Config.DTLS_PORT_MIN || 
        options.dtlsListenPort > Config.DTLS_PORT_MAX) {
        throw new Error(
            "PHEA: 'dtlsListenPort' must be of type int between " + 
            Config.DTLS_PORT_MIN + " and " + Config.DTLS_PORT_MAX + " inclusive."
        )
    }

}

