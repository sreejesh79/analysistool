import moment = require("moment");

class DateUtils {
    static formatDate(date: any, format="MM/DD/YYYY") {
		return moment(date).format(format);
	}
    
}

export default DateUtils;