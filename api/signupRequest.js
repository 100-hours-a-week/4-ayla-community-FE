import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const userSignup = async data => {
    const result = await requestJson(`${getServerUrl()}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return result;
};

export const checkEmail = async email => {
    const result = await requestJson(
        `${getServerUrl()}/users/email/${email}`,
        {
            method: 'GET',
            // headers: {
            //     'Content-Type': 'application/json',
            // },
        },
    );
    return result;
};

export const checkNickname = async nickname => {
    const result = await requestJson(
        `${getServerUrl()}/users/nickname/${nickname}`,
        {
            method: 'GET',
            // headers: {
            //     'Content-Type': 'application/json',
            // },
        },
    );
    return result;
};

export const fileUpload = async file => {
    const result = await requestJson(
        `${getServerUrl()}/uploads/profile-image`,
        {
            method: 'POST',
            body: file,
        },
    );
    return result;
};
