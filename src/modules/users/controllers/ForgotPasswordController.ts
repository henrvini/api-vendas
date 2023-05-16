import { Request, Response } from "express";
import SendForgotPasswordEmailService from "../services/SendForgotPasswordEmailService";

export default class ForgotPasswordController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const SendForgotPasswordEmail = new SendForgotPasswordEmailService();

    await SendForgotPasswordEmail.execute({ email });

    return res.status(204).json();
  }
}
