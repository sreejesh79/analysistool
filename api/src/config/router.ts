class RouterConfig {

    public static routes(): any {
        return {
            "/" : "home.get",
            "/file/:filename": "file.getFile",
            "/download/:studyId/:type": "download.all"
        };
    }
}

export default RouterConfig;
