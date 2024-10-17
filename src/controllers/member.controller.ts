

import { Request, Response } from "express";
import { LoginInput, Member, MemberInput } from '../libs/types/member';
 import { T } from "../libs/types/common";
 import { MemberType } from '../libs/enums/member.enum';
 import MemberService from '../models/Member.service';
 import Errors, { HttpCode,  Message } from "../libs/Errors";
 import AuthService from "../models/Auth.service";
import { token } from "morgan";
import { AUTH_TIMER } from "../libs/config";

 const  memberService = new MemberService();
 const authService = new AuthService();



 const memberController: T = {};

 memberController.signup = async (req: Request, res: Response) => {
     try {
       console.log("signup");
       const input: MemberInput = req.body,
       result: Member = await memberService.signup(input);
   const token = await authService.createToken(result);
   res.cookie("accessToken", token, {
    maxAge: AUTH_TIMER * 3600 * 1000,
    httpOnly: false,
  });

  res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
   

       res.json({member:result});
     } catch (err) {
       console.log("Error, signup:", err);
       if(err instanceof Errors) res.status (err.code).json(err);
       else res.status(Errors.standart.code).json (Errors.standart);
      // res.json({});
     }
   };

   memberController.login = async (req: Request, res: Response) => {
     try {
       console.log("login");
       const input: MemberInput = req.body,
       result = await memberService.login(input),
      token = await authService.createToken(result);
      res.cookie("accessToken", token, {
        maxAge: AUTH_TIMER * 3600 * 1000,
        httpOnly: false,
      });

    // res.cookie("accessToken", )

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
     } catch (err) {
       console.log("Error, login:", err);
       if(err instanceof Errors) res.status (err.code).json(err);
       else res.status(Errors.standart.code).json (Errors.standart);
      // res.json({});
     }
 };

 memberController.verifyAuth = (req: Request, res: Response) => {
  try {
    let member = null;
    const token = req.cookies["accessToken"];
    if (token) member = authService.checkAuth(token);
    if (!member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    res.status(HttpCode.OK).json({ member: member});
  } catch (err) {
    console.log("Error, verifyAuth:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

   export default memberController;