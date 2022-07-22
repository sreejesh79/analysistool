class Home {
    public static async get(ctx: any, next: () => void): Promise<any> {
        ctx.body = "Welcome to LOOKLOOKAT API";
    }
}

export default Home;
