class ApiResponse {

    private _context: string;
    private _body: any = {};
    private _error: boolean = undefined;
    private _error_code: number = undefined;

    constructor( context: string, body: any = {}, error: boolean = undefined, error_code: number = undefined) {
        this._context = context;
        this._body = body;
        this._error = error;
        this._error_code = error_code;
    }

    public apiSuccess(data?: any): ApiResponse {
        this.error = false;
        this.error_code = 0;
        this.body = data;
        return this;
    }

    public apiError(msg: string): ApiResponse {
        this.error = true;
        this.error_code = 1;
        this.body = msg;
        return this;
    }

    public get context(): string {
        return this._context;
    }

    public set context(value: string) {
        this._context = value;
    }

    public get body(): any {
        return this._body;
    }

    public set body(value: any) {
        this._body = value;
    }

    public get error(): boolean {
        return this._error;
    }

    public set error(value: boolean) {
        this._error = value;
    }

    public get error_code(): number {
        return this._error_code;
    }

    public set error_code(value: number) {
        this._error_code = value;
    }
}

export default ApiResponse;