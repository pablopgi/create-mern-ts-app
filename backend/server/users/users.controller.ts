import * as bodyParser from "body-parser";
import { Router } from "express";
import * as mongoose from "mongoose";
import * as passport from "passport";
import { Strategy } from "passport-local";
import User from "./user.model";

passport.use(new Strategy({ usernameField: "email" }, async (username, password, done) => {
  try {
    const user = await User.findOne({ email: username });
    if (user && user.isPasswordValid(password)) {
      return done(null, user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    return done(error);
  }
}));

const router = Router();

router.route("/register").post(bodyParser.json(), async (request, response) => {
  try {
    const user = new User();
    user.email = request.body.email;
    user.setPassword(request.body.password);
    await user.save();
    const tokenSignature = user.generateJwt();
    return response.status(200).json(tokenSignature);
  } catch (error) {
    return response.status(400).send(error);
  }
});

router.route("/login").post(bodyParser.json(), (request, response) => {
  passport.authenticate("local", (error, user) => {
    if (!user) {
      return response.status(400).json({ error: error.message });
    }
    const tokenSignature = user.generateJwt();
    return response.status(200).json(tokenSignature);
  })(request, response);
});

export default router;
