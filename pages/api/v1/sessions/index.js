import { createRouter } from "next-connect";
import controller from "infra/controller.js";

import authentication from "models/authentication.js";
import authorization from "models/authorization";
import session from "models/session.js";
import { ForbiddenError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Your account is not login",
      action: "Contact support to activate your account",
    });
  }

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  const secureOutputValues = authorization.filterOutput(authenticatedUser, "read:session", newSession);

  return response.status(201).json(secureOutputValues);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const userTryingToDelete = request.context.user;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const expireSession = await session.expireById(sessionObj.id);
  await controller.clearSessionCookie(response);
  const secureOutputValues = authorization.filterOutput(userTryingToDelete, "read:session", expireSession);

  return response.status(200).json(secureOutputValues);
}
