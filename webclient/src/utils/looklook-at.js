import moment from "moment";
import Utils from "./utilityScript";
class LookLookAtUtils {

    static navigateTo (url: any){
        const { history } = this.props;
        history.push(url);
    }

    static getParticipantName(userType, p) {
		if(userType === "Admin") {
			p.name = Utils.titleCase(p.user.firstName.trim()+" "+ (p.user.lastName ? p.user.lastName.trim() : p.user.lastName));
		} else {
			let lastNameChar = "";
			if(p.user.lastName) {
				const lNameFC = p.user.lastName.trim().substr(0,1);
				lastNameChar = lNameFC.toLocaleUpperCase();	
			}
			p.name = Utils.titleCase(p.user.firstName.trim() + " " + lastNameChar);
				
		}
		return p;
	}

	static getParticipantNameByFieldName(userType, p, fieldName) {
		if(userType === "Admin") {
			p.name = p[fieldName].firstName.trim()+" "+ (p[fieldName].lastName ? p[fieldName].lastName.trim() : p[fieldName].lastName);
		} else {
			let lastNameChar = "";
			if(p[fieldName].lastName) {
				const lNameFC = p[fieldName].lastName.trim().substr(0,1);
				lastNameChar = lNameFC.toLocaleUpperCase();	
			}
			p.name = p[fieldName].firstName.trim() + " " + lastNameChar;
				
		}
		return p;
	}

	static getNameByUserType(userType, user) {
		if(userType === "Admin") {
			user.name = user.firstName.trim()+" "+ (user.lastName ? user.lastName.trim() : user.lastName);
		} else {
			let lastNameChar = "";
			if(user.lastName) {
				const lNameFC = user.lastName.trim().substr(0,1);
				lastNameChar = lNameFC.toLocaleUpperCase();	
			}
			user.name = user.firstName.trim() + " " + lastNameChar;
				
		}
		return user;
	}
	static getArrayOfIds(data, id) { // In Utils
		const temp = [];
		let d;
		for (d of data) {
			if(d._id !== id) {
				temp.push(d._id);
			}
		}
		return temp;
	}
	static formatDate(date, format="MM/DD/YYYY") {
		return moment(date).format(format);
	}
}

export default LookLookAtUtils;