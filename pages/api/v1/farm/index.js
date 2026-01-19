import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { UnauthorizedError } from "infra/errors.js";
import session from "models/session.js";
import farm from "models/farm.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:farm"), getHandler);
router.post(controller.canRequest("create:farm"), postHandler);
router.patch(controller.canRequest("update:farm"), patchHandler);
router.delete(controller.canRequest("delete:farm"), deleteHandler);

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renwedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renwedSession.token, response);
  const foundFarm = await farm.findOneById(request.body.id);

  if (foundFarm.user_id !== sessionObj.user_id) {
    throw new UnauthorizedError({
      message: "You do not have permission to delete this farm",
      action: "Check your permissions and try again",
      status_code: 401,
    });
  }

  const deletedFarm = await farm.deleteFarm(foundFarm.id);

  response.status(200).json(deletedFarm);
}

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renwedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renwedSession.token, response);
  const foundFarm = await farm.findOneById(request.body.id);

  if (foundFarm.user_id !== sessionObj.user_id) {
    throw new UnauthorizedError({
      message: "You do not have permission to update this farm",
      action: "Check your permissions and try again",
      status_code: 401,
    });
  }

  const updatedFarm = await farm.update(foundFarm.id, {
    farm_name: request.body.farm_name,
  });

  response.status(200).json(updatedFarm);
}

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renwedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renwedSession.token, response);
  const farms = await farm.findAllByUserId(sessionObj.user_id);

  response.status(200).json(farms);
}

async function postHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObj = await session.findOneValidByToken(sessionToken);
  const renwedSession = await session.renew(sessionObj.id);
  controller.setSessionCookie(renwedSession.token, response);

  const newFarm = await farm.create({
    farm_name: request.body.farm_name,
    user_id: sessionObj.user_id,
  });
  const foundFarm = await farm.findOneById(newFarm.id);
  response.status(201).json(foundFarm);
}
