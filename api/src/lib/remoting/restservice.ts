import bindRoutes from "./route_binding";
class RestApiService {
    private static _instance: RestApiService;
    private static _singleton: boolean = true;
    private  _app: any;
    private _useAuth: boolean = true;
    private _handshake: string = "";
    private _isHandshake: boolean = false;
    constructor() {
        if (RestApiService._singleton) {
            throw new SyntaxError("This is a singleton class. Please use RestApiService.instance instead!!");
        }
    }
    public static get instance(): RestApiService {
        if (!this._instance) {
            this._singleton = false;
            this._instance = new RestApiService();
            this._singleton = true;
        }
        return this._instance;
    }

    public init(app: any, handshake: string = "", useAuth: boolean = true): void {
        this.initProperties(app, handshake, useAuth);
        // this.validateHandshake();
        bindRoutes(app);
     }

     private initProperties(app: any, handshake: string = "", useAuth: boolean = true): void {
        this._app = app;
        this._useAuth = useAuth;
        this._handshake = handshake;
        // this._io = socketIO(app.server);
    }
    // private addEvents(app: any) {
    //     bindRoutes(app);
    // }
}
export default RestApiService;