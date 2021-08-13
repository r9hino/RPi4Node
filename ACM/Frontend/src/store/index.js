import { createStore } from "vuex";

export default createStore({
    state: {
        user: null,
        token: null,
        authenticated: false,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setToken(state, token) {
            state.token = token;
        },
        setAuthenticated(state, isAuthenticated) {
            state.authenticated = isAuthenticated;
        },
    },
    actions: {},
    getters: {
        getUser: (state) => state.user,
        getToken: (state) => state.token,
        getAuthenticated: (state) => state.authenticated,
    },
});