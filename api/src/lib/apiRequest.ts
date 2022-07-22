class ApiRequest {

    private _context: string;
    private _socket: any;
    private _body: any;

    constructor(context: string, socket: any, body: any) {
        this._context = context;
        this._socket = socket;
        this._body = body;
    }

    public get context(): string {
        return this._context;
    }

    public set context(value: string) {
        this._context = value;
    }

    public get socket(): any {
        return this._socket;
    }

    public set socket(value: any) {
        this._socket = value;
    }

    public get body(): any {
        return this._body;
    }

    public set body(value: any) {
        this._body = value;
    }
}

export default ApiRequest;