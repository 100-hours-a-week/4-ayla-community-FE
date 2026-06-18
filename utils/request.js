// Content-Type 확인 후 JSON 파싱 (비 JSON 응답에서 에러 방지)
export const parseJsonSafe = async response => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return null;
    }
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};

// fetch 공통 요청 함수 - { ok, status, code, data, body } 형태로 반환
export const requestJson = async (url, options = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    const headers = {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    const response = await fetch(url, { ...options, headers });
    const body = await parseJsonSafe(response);
    return {
        response,
        ok: response.ok,
        status: response.status,
        code: body && body.code ? body.code : null,
        data: body && Object.prototype.hasOwnProperty.call(body, 'data')
            ? body.data
            : null,
        body,
    };
};
