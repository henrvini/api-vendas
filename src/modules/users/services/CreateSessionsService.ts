import AppError from "@shared/errors/AppError";
import { getCustomRepository } from "typeorm";
import User from "../typeorm/entities/User";
import UsersRepository from "../typeorm/repositories/UsersRepository";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: User;
  token: string;
}

class CreateSessionsService {
  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findByEmail(email);
    const msgError = "Incorrect email/password combination.";

    if (!user) {
      throw new AppError(msgError, 401);
    }

    const passwordConfirmed = await compare(password, user.password);

    if (!passwordConfirmed) {
      throw new AppError(msgError, 401);
    }

    const token = sign({}, "HARDOCE md5 hash generator HERE", {
      subject: user.id,
      expiresIn: "1d",
    });

    return { user, token };
  }
}

export default CreateSessionsService;
