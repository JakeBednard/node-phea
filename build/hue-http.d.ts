export declare namespace HueHttp {
    function discoverBridge(): Promise<any[]>;
    function registration(ipAddress: string): Promise<{
        ip: string;
        username: any;
        psk: any;
    }>;
    function getGroup(address: string, username: string, groupId: string | number): Promise<any>;
    function setEntertainmentMode(state: boolean | undefined, address: string, username: string, group?: string): Promise<void>;
}
