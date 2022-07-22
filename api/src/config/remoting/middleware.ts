class RemotingMiddleware {

    public static middlewares(): any {
        return {
            // "auth": "!",
            // "*" : ["fetchUser.get", "authUser.validateToken"]
            "*" : ["token.validateToken"]
        };
    }
}

export default RemotingMiddleware;