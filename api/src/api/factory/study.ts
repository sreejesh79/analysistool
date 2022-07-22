class Study {

    static filter(filter: string) {
        let responseObj: any = {};
        switch (filter) {
            case "archived":
                responseObj = { "isDeleted": false, "isArchived": true, "isHide": false };
            break;

            case "unarchived":
                responseObj = { "isDeleted": false, "isArchived": false, "isHide": false };
            break;

            case "hidden":
                responseObj = { "isDeleted": false, "isArchived": true, "isHide": true };
            break;

            default :
                responseObj = {
                    error: true,
                    body: "Invalid Filter"
                };
            break;
        }

        return responseObj;
    }

}

export default Study;