import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session";
import user from "models/user";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renwedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renwedSession.token, response);

  const userFound = await user.findOneById(sessionObj.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0",
  );

  const userTryingToGet = request.context.user;
  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user:self",
    userFound,
  );
  return response.status(200).json(secureOutputValues);
}
