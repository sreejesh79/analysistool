import CryptoHelper from "./cryptohelper";
import _ from "underscore";
class Utils {

    static twoDigit(c){
        return c>9?c:"0"+c;
    }
    static async queryParams(search){
		var obj = await this.getQueryObj(search);
		if(obj && (obj.q || obj.qt)){
			const decryptObj = CryptoHelper.decrypt(obj.q || obj.qt, process.env.NONCE);
			if (decryptObj.error) {
				return null;
			}
			return decryptObj.decryptedData[0];
		}
		return obj;

	}
	static async getQueryObj(search){
		if(!search){
			return null;
		}
		const decode = decodeURI(search)
		const query = decode.slice(1)
		var obj = {};
		var pairs = query.split('&');
		for(var i in pairs){
			var split = pairs[i].split('=');
			obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
		}
		return obj

	}
	static validiateRoutes(routes, path) {
		for(var i=0;i<routes.length;i++){
			const route = routes[i];
			if(path === `/${route}` || path.indexOf(route+"/") === 1){
			  return true;
			}
		  }
		return false;
	}
	static checkSpecialChar(data){
    var specialCharReg = /^[a-zA-Z0-9.,]*$/g;
    return specialCharReg.test(data);
	}
	static escapeRegExp(string){
    return string.replace(new RegExp('[\\[\\]/{}()*+?.\\^$| ]', "g"), "\\$&");
	}
	static removeExtras(text) {
    if(!text)return '';
    return _.unescape(text.replace(/(\r\n\t|\n|\r\t)/gm," ").replace(/\s\s+/g, ' ').trim());
	}
	static getCountOfApprearance(str, substr){
			let count = 0;
			let ind = str.indexOf(substr);
			while(ind != -1){
				ind=str.indexOf(substr,ind+1);
				++count;
			}
			return count;
	}

	static titleCase(str) {
		return str.toLowerCase().split(' ').map((word) => word.replace(word[0], word[0].toUpperCase())).join(' ');
	}
	
}

export default Utils;