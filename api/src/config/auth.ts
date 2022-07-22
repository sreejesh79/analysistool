import path from "path";
import fs from "fs";
class Auth {

    public static RSA_PUBLIC_KEY: any;

    public static init(dirname, app): void {
        console.log("setUpPublicKey", dirname);
        const publicKeyPath: string = path.join(dirname, "public.pem");
        this.RSA_PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");
        // console.log("this.RSA_PUBLIC_KEY", this.RSA_PUBLIC_KEY);
    }
}

export default Auth;