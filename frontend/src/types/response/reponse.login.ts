export type LoginResponse = {
    success: boolean;
    message: string;
    token?: string; // ถ้ามี Token
    user?: {
        users_id: string;
        username: string;
        status_role: string;
    };
};