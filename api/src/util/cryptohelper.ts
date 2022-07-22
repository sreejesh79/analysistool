// flow
import CryptoJS from "crypto-js";
// var _data = [{id: 1}, {id: 2} , {id: 2}, {id: 2}, {id: 4}, {id: 5}, {id: 2}]
class CryptoHelper {

    static encrypt(data: any, nonce: string): void {
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), nonce);
        const plainText = ciphertext.toString();
        return plainText;
    }

    static decrypt(plainText: string, nonce: string): any {
        const bytes  = CryptoJS.AES.decrypt(plainText, nonce);
        try {
           const b = bytes.toString(CryptoJS.enc.Utf8);
           const decryptedData = JSON.parse(b);
            return {
                error: false,
                decryptedData
            }
        } catch (e) {
            console.log(e);
        }
        return {
            error: true,
            message: "Error in decryption"
        };
    }
}

export default CryptoHelper;