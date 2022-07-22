let _singleton: boolean = true;
let _instance: LocalStorageService;

class LocalStorageService {

    APP_KEY: string = "looklook-at";
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use LocalStorageService.instance instead!');
        }      
    }

    static get instance(): LocalStorageService{
        if (!_instance) {
            _singleton = false;
            _instance = new LocalStorageService();
            _singleton = true;
        }
        return _instance;
    }

    setItem(key,value){
        localStorage.setItem(this.APP_KEY+key,value);
    }
    
    setItemBoolean(key,value){
        this.setItem(key,value?"true":"false");
    }
    

    getItemBoolean(key){
        return this.getItem(key)==="true";
    }

    getItem(key){
        return localStorage.getItem(this.APP_KEY+key);
    }

    clear(){
        localStorage.clear();
    }
}

export default LocalStorageService;