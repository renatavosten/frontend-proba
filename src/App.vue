<template>
  <div id="app">
    <div class="header">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="navbar fixed-top">
              <router-link class="active" to="/">Početna</router-link>
              <div v-if="auth.authenticated" class="navbar-center">
                <input v-model="store.searchTerm" class="form-control mr-sm-2" type="search" placeholder="Trazi po nazivu,sastojku ili kategoriji" aria-label="Search">
              </div>
              <div class="navbar-right">
                <router-link v-if="auth.authenticated" class="nav-link" to="/dodajrecept">Dodaj recept</router-link>
                <router-link v-if="auth.authenticated" class="nav-link" to="/mojprofil">Moj profil</router-link>
                <router-link v-if="auth.authenticated" class="nav-link" to="/postavke">Postavke</router-link>
                <a v-if="auth.authenticated" @click="logout" class="nav-link" href="#">Odjava</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script>
import store from '@/store.js';
import { Auth } from '@/services';

export default {
  data() {
    return {
      auth: Auth.state,
      store: store,
    };
  },
  methods: {
   logout() {
    Auth.logout();
    this.$router.go();
   }
  },
created () {
    
  }
}
</script>

<style lang="scss">
.navbar {
  overflow: hidden;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgb(13, 18, 41);
  padding: 0px;
}
.navbar a {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 20px;
  font-weight: bold;
}
.navbar a:hover {
  background: #ddd;
  color: black;
}
.navbar-right{
  float: right;
}
.nav-link{
  color:white;
  font-size: 30px;
}
.mr-sm-2 {
  width: 350px;
}

</style>