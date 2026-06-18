import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const getPosts = (cursor = null, limit = 10, sort = 'latest') => {
    const params = new URLSearchParams({ sort, limit });
    if (cursor) params.set('cursor', cursor);
    const result = requestJson(
        `${getServerUrl()}/posts?${params.toString()}`,
        {
            credentials: 'include',
        },
    );
    return result;
};

export const searchPosts = (keyword, offset = 0, limit = 5, sort = 'recent') => {
    const query = new URLSearchParams({
        keyword,
        offset,
        limit,
        sort,
    });
    const result = requestJson(
        `${getServerUrl()}/posts/search?${query.toString()}`,
        {
            credentials: 'include',
        },
    );
    return result;
};
