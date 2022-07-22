import * as jwt from "jwt-simple";
import Token from "./vo/token";

class Secret {
    private  readonly TOKEN: string = "looklook@sreejesh.ashish.abhay.aneesh@focalworks";
    private  readonly EXPIRY: number = 7; // in days

    public getToken(user: any): Token {
        const expires: number = this.expiresIn(this.EXPIRY);
        const encodedToken: string = jwt.encode({uid: user.id, exp: expires}, this.TOKEN);
        const token: Token = new Token(encodedToken, expires, user);
        return token;
    }

    private expiresIn(numDays: number): number {
        const dateObj: Date = new Date();
        return dateObj.setDate(dateObj.getDate() + numDays);
    }

    public tokenKey(): string {
        return this.TOKEN;
    }
}

export default Secret;