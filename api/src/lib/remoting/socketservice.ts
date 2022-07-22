import http from "http";
import  socketIO  from "socket.io";
import RemotingMiddleware from "../../config/remoting/middleware";
import { isArray } from "util";
import ApiRequest from "../apiRequest";
import ApiResponse from "../apiResponse";

class SocketService {
    private static _instance: SocketService;
    private static _singleton: boolean = true;
    private readonly CALLSERVER: string = "callserver";
    private readonly DATA_PROCESSING: string = "data_processing";
    private  _app: any;
    private _useAuth: boolean = true;
    private _handshake: string = "";
    private _isHandshake: boolean = false;
    private _io: any;

    constructor() {
        if (SocketService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use SocketService.instance instead!!");
        }
    }

    public static get instance(): SocketService {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new SocketService();
            this._singleton = true;
        }
        return this._instance;
    }

    public init(app: any, handshake: string = "", useAuth: boolean = true): void {
       this.initProperties(app, handshake, useAuth);
       this.validateHandshake();
       this.addEvents();
    }

    private initProperties(app: any, handshake: string = "", useAuth: boolean = true): void {
        this._app = app;
        this._useAuth = useAuth;
        this._handshake = handshake;
        this._io = socketIO(app.server);
    }


    private validateHandshake(): void {
        this._io.use((socket: any, next: any) => {            // console.log(socket.handshake.query);
            if (socket.handshake.query.hs_token == this._handshake) {
                return next();
            }
            console.log("connection failed");
            return next(new Error ("Handshake Failed!!"));
        });
    }

    public dispatchData(context: any, socket: any, data: any): void {
        socket.emit(this.DATA_PROCESSING + "_" + context, data);
    }

    private addEvents(): void {
        this._io.on("connect", (socket: any) => {
            socket.on(this.CALLSERVER, async (data: any, callCB: (data: any) => void) => {
                const response: any = await this.handleCallFromClient(socket, data);
                return callCB(response);
            });
        });
    }

    private async handleCallFromClient(socket: any, data: any): Promise<any> {
        try {
            const context: string = data.context;
            const socketRequest: ApiRequest = this.createRequestObj(context, socket, data.body);
            const socketRespose: ApiResponse = this._createResposeObj(context);
            const mwResponse: any = await this.addMiddleWares(socketRequest, socketRespose);
            let response: any;
            if (mwResponse && mwResponse._error) {
                response = mwResponse;
                return response;
            }
            const contextPath: string = context.substring(context.indexOf(" "));
            const arrContext: string[] = contextPath.split(".");
            const controller: string = arrContext[0];
            const method: string = arrContext[1];
            const className: any = await import("../../api/controllers/" + controller);
            response =  await className.default[method](socketRequest, socketRespose);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    private createRequestObj(context: string, socket: any, data: any): ApiRequest {
        return new ApiRequest(context, socket, data);
    }

    private _createResposeObj(context: string): ApiResponse {
        return new ApiResponse(context);
    }

    private async addMiddleWares(req: ApiRequest, res: ApiResponse): Promise<any> {
        let response: any;
        const context: string = req.context;
        const arrContext: Array<string> = context.split(".");
        if (arrContext.length > 0) {
            const controller: string = arrContext[0];
            const action: string = arrContext[1];
            const middlewares: any = RemotingMiddleware.middlewares();

            for (const key of Object.keys(middlewares)) {
                if (middlewares[context] && middlewares[context] != "!" ) {
                    response = await this.addMiddleware(middlewares[context], req, res);
                } else if (middlewares[controller] && middlewares[controller] != "!") {
                    response = await this.addMiddleware(middlewares[context], req, res);
                } else if (middlewares[controller] === undefined && key === "*" && middlewares[key] != "!") {
                    response = await this.addMiddleware(middlewares[key], req, res);
                }
            }
        }
        return response;
    }

    private async addMiddleware(mws: any, req: ApiRequest, res: ApiResponse): Promise<any> {
        let response: any;
        if (isArray(mws)) {
            for (const mw of mws) {
                response = await this.addOneMiddleware(mw, req, res);
                if ( response.error) {
                    break;
                }
            }
        } else {
            response = await this.addOneMiddleware(mws, req, res);
        }
        return response;
    }

    private async addOneMiddleware(mw: any, req: ApiRequest, res: ApiResponse): Promise<any> {
        const arrContext: string[] = mw.split(".");
        const middleware: string = arrContext[0];
        const action: string = arrContext[1];
        let response: any;
        try {
            const className: any = await import(`../../api/middlewares/${middleware}`);
            if (action) response =  await className.default[action](req, res);
        } catch (e) {
            console.log(e);
        }
        return response;
    }

}

export default SocketService;