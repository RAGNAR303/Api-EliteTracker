import { request, Request, Response } from 'express';

const clientId = 'Ov23lihC4o5c7VA2iSLe';
const clientSecret = '769c871a341c6d54cfcc49b2d2b0aa9915626107';

export class AuthController {
  auth = async (request: Request, response: Response) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;

    response.redirect(redirectUrl);
  };

  authCallback = async (request: Request, response: Response) => {
    console.log({ ...request.query });
    return response.send();
  };
}
