import { user } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { userRepository } from "@modules/user/userRepository";
import { TypePayloadUser } from "@modules/auth/authModel";
import bcrypt from "bcrypt";
import { generateAccessToken } from "@common/utils/jwt"

export const authService = {
    login: async (payload: TypePayloadUser, res: any, req: any) => {
        try {


            const checkUser = await userRepository.findByUsername(payload.username);


            if (!checkUser) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Incorrect Username",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            const isPasswordValid = await bcrypt.compare(payload.password, checkUser.password);

            if (!isPasswordValid) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Incorrect password",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            const accessToken = generateAccessToken(checkUser.users_id, checkUser.status_role ?? "default_role");

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            return new ServiceResponse<user>(
                ResponseStatus.Success,
                "Login success",
                checkUser,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error create user: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    logout: async (res: any) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            return new ServiceResponse(
                ResponseStatus.Success,
                "Logout successful",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error during logout: " + (ex as Error).message,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    verifyToken: async (user: any) => {
        try {
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Invalid token",
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }

            const dbUser = await userRepository.findByIdAsync(user.users_id);
            if (!dbUser) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "User not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            return new ServiceResponse(
                ResponseStatus.Success,
                "Token is valid",
                {
                    status_role: dbUser.status_role,
                    username: dbUser.username
                },
                StatusCodes.OK
            );
        } catch (ex) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error verifying token: " + (ex as Error).message,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};