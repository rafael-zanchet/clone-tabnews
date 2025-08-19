import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";
async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);

    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Athentication failed",
        action: "Check data and try again",
      });
    }
    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let userFound;

    try {
      userFound = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email does not match",
          action: "Check data and try again",
        });
      }
      throw error;
    }
    return userFound;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPassword = await password.compare(
      providedPassword,
      storedPassword,
    );
    if (!correctPassword) {
      throw new UnauthorizedError({
        message: "Password does not match",
        action: "Check data and try again",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
