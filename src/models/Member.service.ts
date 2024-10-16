import MemberModel from "../schema/Member.models";
import {
  MemberInput,
  Member,
  LoginInput,
  MemberUpdateInput,
} from "../libs/types/member";
 import Errors, { HttpCode, Message } from "../libs/Errors";
 import { MemberStatus, MemberType } from "../libs/enums/member.enum";
 import * as bcrypt from "bcryptjs";
 import { shapeIntoMongooseObjectId } from "../libs/types/config";


class MemberService {
    private readonly memberModel;

    constructor() {
      this.memberModel = MemberModel;
}

// *SPA */

  public async signup(input: MemberInput): Promise<Member> {
     // Parolni hash qilish
     
     const salt = await bcrypt.genSalt();
     input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

   try {
     const result = await this.memberModel.create(input);
     result.memberPassword = "";  // Parolni javobdan olib tashlash
     return result.toJSON() as Member;// JSON formatida qaytarish
   } catch (err) {
     console.error("Error , model:signup ", err);
     throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
   }
 }

 public async login(input: LoginInput): Promise<Member | null> {
   //TODO: consider member status later 

   const member = await this.memberModel
     .findOne(
      {
        memberNick: input.memberNick,
        memberStatus: { $ne: MemberStatus.DELETE },
      },
      { memberNick: 1, memberPassword: 1, memberStatus: 1 }
       )
     .lean() // Engil obyektni qaytarish
     .exec();

     // Agar member topilmasa, xato qaytariladi
   if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
   else if (member.memberStatus === MemberStatus.BLOCK)
    throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);

    // Parolni solishtirish
   const isMatch = await bcrypt.compare
   (input.memberPassword, 
     member.memberPassword
     );


     if (!isMatch){
        throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
       }

 // Member topilgan bo'lsa, uni qaytarish
      return await this.memberModel.findById(member._id).lean().exec();
 }

 public async getMemberDetail(member: Member): Promise<Member> {
   const memberId = shapeIntoMongooseObjectId(member._id);
   const result = await this.memberModel
     .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
     .exec();

   if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);


   return result;




 /**SSR */

 /**class MemberService {
   processSignup(newMember: MemberInput) {
     throw new Error('Method not implemented.');
   }
   processLogin(input: LoginInput) {
     throw new Error('Method not implemented.');
   }
   private readonly memberModel;
   constructor() {
     this.memberModel = MemberModel;
   }*/


public async processSignup(input: MemberInput): Promise<Member> {
  const exist = await this.memberModel
    .findOne({ memberType: MemberType.RESTUARANT })
    .exec();
  console.log("Burak bor");
  if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

  const salt = await bcrypt.genSalt();
  input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

  try {
    // const result = await this.memberModel.create(input);
    const tempResult = new this.memberModel(input);
    const result = await tempResult.save();
    result.memberPassword = "";
    return result;
  } catch (err) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }
}
  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );
    // const isMatch = input.memberPassword === member.memberPassword;

    if (!isMatch) {
        throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return await this.memberModel.findById(member._id).exec();
  }
  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel.find({ MemberType: MemberType.USER });
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
  public async updateChosenUser(input: MemberUpdateInput): Promise<Member[]> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = this.memberModel.findByIdAndUpdate(
      { _id: input._id },
      input,
      { new: true }
    );
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default MemberService;