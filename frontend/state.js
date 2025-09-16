window.AppState = {
    user: null,
    async loadUser() {
        try {
            const data = await Fetch('auth/check-login', { method: 'GET' });
            this.user = data.user;
        } catch (err) {
            this.user = null;
        }
    },
    isLoggedIn() {
        return !!this.user;
    }
};