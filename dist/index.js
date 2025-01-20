"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const config_1 = require("./config");
const middleware_1 = require("./middleware");
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredbody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(10),
        password: zod_1.z.string().min(8).max(20)
            .refine((value) => /[a-z]/.test(value) &&
            /[A-Z]/.test(value) && /\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value))
    });
    const requireddata = requiredbody.safeParse(req.body);
    if (!requireddata.success) {
        res.status(400).json({
            message: "incorrct format",
            error: requireddata.error.errors
        });
    }
    const { username, password } = req.body;
    let errorthrown = false;
    try {
        const hashedpassword = yield bcrypt_1.default.hash(password, 2);
        yield db_1.usermodel.create({
            username: username,
            password: hashedpassword
        });
    }
    catch (e) {
        res.json({
            message: "user already exits"
        });
        errorthrown = true;
    }
    if (!errorthrown) {
        res.status(200).json({
            message: "signed up successfully"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const users = yield db_1.usermodel.findOne({
        username
    });
    if (!users) {
        res.status(403).json({
            message: "user not found"
        });
    }
    // @ts-ignore
    const passwordmatch = yield bcrypt_1.default.compare(password, users.password);
    if (passwordmatch) {
        const token = jsonwebtoken_1.default.sign({
            // @ts-ignore
            id: users._id.toString()
            //@ts-ignore
        }, config_1.JWT_SECRET);
        res.json({
            token: token
        });
    }
    else {
        res.json({
            message: "passsword incorrect"
        });
    }
}));
app.post("/api/v1/content", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const link = req.body.link;
    yield db_1.contentmodel.create({
        type,
        link,
        // @ts-ignore
        userid: req.userid,
        tag: []
    });
    res.json({
        message: "content added"
    });
}));
app.get("/api/v1/content", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore 
    const userid = req.userid;
    const content = yield db_1.contentmodel.find({
        userid: userid
    }).populate("userid", "username");
    res.json({
        content: content
    });
}));
app.delete("/api/v1/content", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentid = req.body.contentid;
    yield db_1.contentmodel.deleteMany({
        contentid: contentid,
        // @ts-ignore
        userid: req.userid
    });
    res.json({
        message: contentid
    });
}));
app.post("/api/v1/brain/share", middleware_1.middleware, (req, res) => {
});
app.post("/api/v1/brain/:sharelink", (req, res) => {
});
app.listen(3000);
