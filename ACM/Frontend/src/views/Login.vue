<template>
  <main class="form-login">
    <form @submit="login">
        <img class="mb-4" src="../assets/logo128.png" alt="" width="72" height="90">
        <h1 class="h3 mb-3 fw-normal">Please Log In</h1>

        <div class="form-floating">
            <input v-model="username" type="user" class="form-control" id="floatingInput" placeholder="User">
            <label for="floatingInput">User</label>
        </div>
        <div class="form-floating">
            <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
            <label for="floatingPassword">Password</label>
        </div>
        <div class="checkbox mb-3">
            <label>
                <input type="checkbox" value="remember-me"> Remember me
            </label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" type="submit">Log in</button>
        <div class="warning" v-if="!!error" >
            <p class='warning'>{{ error }}</p>
            <p class='warning'>Attempts available: {{ attemptsAvailable }}</p>
        </div>
    </form>
  </main>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    data: () => {
        return {
            username: '',
            password: '',
            error: null,
            attemptsAvailable: null,
            remainingTime: 0,
        };
    },
    methods: {
        ...mapMutations(["setUser", "setToken", "setAuthenticated"]),
        async login(e){
            e.preventDefault();
            const response = await fetch("http://rpi4id0.mooo.com:5000/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                //credentials: 'include',
                body: JSON.stringify({
                username: this.username,
                password: this.password,
                }),
            });

            if(response.status == 200){
                this.error = null;

                const {user, token} = await response.json();
                this.setUser(user);
                this.setToken(token);
                this.setAuthenticated(true);
                //console.log(user, token);
                await this.$router.push("/");
            }
            else{
                const {message, attemptsAvailable, remainingTime} = await response.json();
                this.error = message;
                this.attemptsAvailable = attemptsAvailable;
                this.remainingTime = remainingTime;
                //console.log(this.error);
            }
        },
    },
};
</script>

<style>
body {
  align-items: center;
  padding-bottom: 40px;
  background-color: #f5f5f5;
  text-align: center!important;
}

div.checkbox{
  margin-top: 15px;
}

.form-login {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 85px auto auto auto;
}

.form-login .checkbox {
  font-weight: 400;
}

.form-login .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="user"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.warning {
    margin-top: 20px;
}
p.warning {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>