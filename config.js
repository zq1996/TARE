const Config = {
    local: {
        apiBase: 'http://localhost:3000'
    },
    production: {
        apiBase: 'https://taretool.vercel.app'
    },
    getCurrent() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocal ? this.local : this.production;
    }
};
