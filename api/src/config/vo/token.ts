class Token {
    public token: string;
    public expires: number;
    public user: any;

    constructor(token: string, expires: number, user: any) {
        this.token = token;
        this.expires = expires;
        this.user = user;
    }
}

export default Token;