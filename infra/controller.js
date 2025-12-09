import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "infra/errors.js";
import * as cookie from "cookie";
import session from "models/session.js";
import user from "models/user.js";
import { forbidden } from "next/navigation";

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }
  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, // Convert milliseconds to seconds
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);
    return next();
  }

  injectAnonymousUser(request);
  return next();
}

async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const userObj = await user.findOneById(sessionObj.user_id);

  request.context = {
    ...request.context,
    user: userObj,
  };
}

async function injectAnonymousUser(request) {
  const anonymousUserObj = {
    features: ["read:activation_token", "create:session", "create:user"],
  };
  request.context = {
    ...request.context,
    user: anonymousUserObj,
  };
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user;

    if (userTryingToRequest.features.includes(feature)) {
      return next();
    }
    throw new ForbiddenError({
      message: "You do not have permission to perform this action",
      action: "Contact support if you believe this is an error",
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAuthenticatedUser,
  injectAnonymousOrUser,
  canRequest,
};
export default controller;
