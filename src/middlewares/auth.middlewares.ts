import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../@types/user.type';

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction, // mostra que e uma "Middleware"
) {
  // pegando o token que foi criado authController que e mandaado no headers
  const authToken = request.headers.authorization;

  console.log({ authToken: authToken });
  // se não receber o token ele barra , não deixa continuar
  if (!authToken) {
    return response
      .status(401)
      .json({ message: 'Token not provided(token não fornecido)' });
  }

  const [, token] = authToken.split(' ');

  console.log({ authMiddleware: token });

  try {
    jwt.verify(token, String(process.env.JWT_SECRET), (err, decoded) => {
      if (err) {
        throw new Error();
      }

      request.user = decoded as User;
    });
  } catch {
    return response
      .status(401)
      .json({ message: 'Token is invalid(Token está inválido)' });
  }

  next();
}
