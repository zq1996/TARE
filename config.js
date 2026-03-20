const Config = {
    local: {
        apiBase: 'http://localhost:3000'
    },
    production: {
        apiBase: 'https://tare-project-9lhfuixbh-zq1996s-projects.vercel.app'
    },
    getCurrent() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocal ? this.local : this.production;
    }
};
