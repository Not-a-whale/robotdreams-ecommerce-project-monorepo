import { refreshToken } from "./auth";
import { getSession } from "./session";

export interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const authFetch = async (url: string | URL, options: FetchOptions = {}) => {
    const session = await getSession();
    if (!session?.accessToken) {
        throw new Error('No session found');
    }
    let response = await fetch(url, options);
    if (response.status === 401) {
        if (!session.refreshToken) {
            throw new Error('No refresh token found');
        }
        const newAccessToken = await refreshToken(session.refreshToken);
        if (newAccessToken) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
            };
            response = await fetch(url, options);
        }
        console.log('Token refreshed', newAccessToken);
    }
    return response;
};