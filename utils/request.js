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

// function.js의 getServerUrl과 동일한 로직 (순환 참조 방지)
const getApiBaseUrl = () => {
    if (
        typeof window !== 'undefined' &&
        window.__APP_CONFIG__ &&
        window.__APP_CONFIG__.API_BASE_URL
    ) {
        return String(window.__APP_CONFIG__.API_BASE_URL).trim().replace(/\/+$/, '');
    }
    const host = window.location.hostname;
    return host.includes('localhost') ? 'http://localhost:3000' : `https://${host}`;
};

let isRefreshing = false;
let pendingRefresh = null;

export const tryRefreshToken = () => {
    if (isRefreshing) return pendingRefresh;

    isRefreshing = true;
    pendingRefresh = fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    })
        .then(async res => {
            console.log('[refresh] status:', res.status);
            if (!res.ok) {
                console.warn('[refresh] 서버 오류 — HTTP', res.status);
                return false;
            }
            const body = await parseJsonSafe(res);
            console.log('[refresh] body:', body);
            const newToken = body?.data?.accessToken;
            if (!newToken) {
                console.warn('[refresh] accessToken 없음. body:', body);
                return false;
            }
            localStorage.setItem('accessToken', newToken);
            console.log('[refresh] 성공 — 새 토큰 저장 완료');
            return true;
        })
        .catch(err => {
            console.error('[refresh] 네트워크/CORS 오류:', err);
            return false;
        })
        .finally(() => {
            isRefreshing = false;
            pendingRefresh = null;
        });

    return pendingRefresh;
};

const buildResult = (response, body) => ({
    response,
    ok: response.ok,
    status: response.status,
    code: body?.code ?? null,
    data: body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : null,
    body,
});

// fetch 공통 요청 함수 - { ok, status, code, data, body } 형태로 반환
export const requestJson = async (url, options = {}) => {
    const makeHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const response = await fetch(url, { ...options, headers: makeHeaders() });

    if (response.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            const retryResponse = await fetch(url, { ...options, headers: makeHeaders() });
            const retryBody = await parseJsonSafe(retryResponse);
            return buildResult(retryResponse, retryBody);
        }
        // 갱신 실패 → 로그인으로
        localStorage.removeItem('accessToken');
        location.href = '/html/login.html';
        return buildResult(response, null);
    }

    const body = await parseJsonSafe(response);
    return buildResult(response, body);
};
