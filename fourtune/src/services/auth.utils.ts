export function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export function getStoredToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
}

export function isUserAuthenticated(): boolean {
    const token = getStoredToken();
    if (!token) return false;
    try {
        const { exp } = parseJwt(token);
        // exp가 없는 토큰은 만료 없음으로 간주
        if (!exp) return true;
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
}
