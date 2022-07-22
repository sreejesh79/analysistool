export default class Settings {
    static enviorment = "qa"; //local, live

    static get API_AUTH_BASE_URL() {
        switch(this.enviorment) {
            case "local":
                return "http://192.168.43.34:4005";
            case "qa" :
                return "https://qa-auth.looklook-app.com";
            case "live":
                return "https://api-auth.looklook-app.com";
            default:
                return "http://192.168.7.228:3002";
        }

    }
}