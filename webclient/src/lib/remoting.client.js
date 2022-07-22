// flow
import openSocket from 'socket.io-client';
import User from "../models/user";
import Event from './events/event';
import EventDispatcher from './events/eventdispatcher';
import StudyService from '../services/studyService';
import AuthServerService from '../services/auth-server.service';
const CONNECT: string = "connect";
const CONNECT_FAILED: string = "connect_error";
const CALLSERVER: string = "callserver";
const DATA_PROCESSING: string = "data_processing"

const _handleEventsFromServer = (): void => {
    _handleConnection();
    
}

const _handleConnection =  (): void => {
    try{
        RemotingClient.socket.on(CONNECT, async () => {
            console.log("connected");
            _handleErrors();
        //    const data: User =  await RemotingClient.callServer("test.getResponse",{}, User);
        //    console.log("data", data);
        })
    } catch (e) {
        console.log(e);
    }
    
}

const _handleErrors = (): void => {
    RemotingClient.socket.on(CONNECT_FAILED, (): void => {
        console.log("connection lost");
    })
}

const _parseData = (data: any): void => {

}

class RemotingClient extends EventDispatcher {

    constructor() {
        super();
        this.socket = null;
    }

    static init(endPoint: string, token: string): void {
        let query: string = `hs_token=${token}`;
        this.socket =  openSocket.connect(endPoint, {query:query});
        _handleConnection();
    }

    static async callServer(context: string, data: any, model: any = null, processing?: boolean = false, booReload = true): Promise<any> {
        
        if(AuthServerService.token === "" || data.token === ""){
            await AuthServerService.refreshAccessToken();
            await AuthServerService.wait(50);
            data.token = AuthServerService.token;
        }
        
        const dispatch = (data) => {
            this.dispatchEvent(new Event(StudyService.instance.STUDY_DATA, data));
        }

        if(processing) {
            this.socket.on(DATA_PROCESSING + "_" + context, dispatch);
        }
        return new Promise(resolve => {
            this.socket.emit(CALLSERVER, {
                context: context,
                body: data
            }, async (retData: any) => {
                // console.log("retData", context, data, retData)
                if(retData && !retData._error && retData._body && model) {
                    let resolvedData:any;
                    if(typeof retData._body !== "string" && retData._body.length >= 0){
                        resolvedData = [];
                        for (const item of retData._body) {
                            resolvedData.push(Object.assign(new model(), item))
                        }
                    }else{
                        resolvedData = Object.assign(new model(), retData._body);
                    }
                    resolve(resolvedData);
                } else {
                    if(booReload && retData._body === "Invalid Token!" && retData._error && retData._error_code === 1 && data.token === AuthServerService.token){
                        const token = await AuthServerService.refreshAccessToken();
                        data.token = AuthServerService.token;
                        return resolve(await RemotingClient.callServer(context, data, model, processing, false));
                    }
                    resolve(retData);
                }
                if(processing){
                    this.socket.off(DATA_PROCESSING + "_" + context, dispatch);
                }
            });
        }) 
        
    }


}

export default RemotingClient;