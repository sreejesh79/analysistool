import SocketService from "./socketservice";
import RestApiService from "./restservice";

class Remoting {

    private static _app: any;
    private static _useSocket: boolean = true;
    private static _endPoint: string = "";

    public static  init(app: any, endPoint: string = "", useSocket: boolean = true): void {
        this.initProperties(app, endPoint, useSocket);
        this.initSockets();
        this.initRestApi();
    }

    private static initProperties(app: any, endPoint: string = "", useSocket: boolean = true): void {
        this._app = app;
        this._useSocket = useSocket;
        this._endPoint = endPoint;
    }

    private static initSockets(): void {
        console.log(process.env.API_HANDSHAKE);
        if (this._useSocket) {
            SocketService.instance.init(this._app, process.env.API_HANDSHAKE);
        }
    }

    private static initRestApi(): void {
        RestApiService.instance.init(this._app);
    }
}

export default Remoting;
