import dotenv from "dotenv";
import Koa from "koa";
import KoaRouter from "koa-router";
import KoaBodyParser from "koa-bodyparser";
import http from "http";
import Remoting from "./lib/remoting";
import  mongoose from "mongoose";
import StudyModel from "./api/models/study";
import path from "path";
import Setting from "./config/setting";
import Middleware from "./config/apimiddleware";
import Router from "./config/apirouter";
import fileSystem from "fs";
import Logger from "./util/logger";
import Auth from "./config/auth";
dotenv.config({path: path.join(__dirname, "../.env")});
dotenv.load();

console.log("process", process.env.MONGODB);

const app: any = new Koa();
const koaRouter: any = new KoaRouter();

// initializing logger
Logger.init(path.join(__dirname, "../"));
Auth.init(path.join(__dirname, "../"), app);
app.use(KoaBodyParser());

// configuring middleware and router
Middleware.routes(koaRouter);
Router.routes(koaRouter);

app.use(koaRouter.routes());
app.use(koaRouter.allowedMethods());

app.server = http.createServer(app.callback());

Remoting.init(app);

mongoose.Promise = global.Promise;
const db: any = mongoose.connect(Setting.MONGODB, { useNewUrlParser: true });
mongoose.connection.once("connected", () => {
    console.log(`Connected to database at ${Setting.MONGODB}`);
    app.server.listen(Setting.PORT);
    console.log(`Server running on port ${Setting.PORT}`);
});


