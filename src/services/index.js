import axios from 'axios';
import $router from '@/router';

// instanca axios-a 
let Service = axios.create({
    baseURL: 'https://wor-back.herokuapp.com/',
    timeout: 10000
});

//prije svakog poslanog requesta na backend izvrši:
Service.interceptors.request.use((request) => {
    try {
        request.headers['Authorization'] = 'Bearer ' + Auth.getToken();
    } catch (e) {
        console.error(e);
    }
    return request;
    
});

//nakon svakog odgovora s backend-a izvrši:
Service.interceptors.response.use(
    (response) => {
        //console.log('Interceptor', response);
        return  response;
    },
    (error) => {
        if (error.response.status == 401) {
            Auth.logout();
            $router.go();
        }
    }
);

// naš objekt 
let Recepti = {
    Comments: {
        async add(receptId, comment) {
            await Service.post(`/recepti/${receptId}/comments/`, comment);
        },
        async delete(receptId, commentId) {
            await Service.delete(`/recepti/${receptId}/comments/${commentId}`);
        },
        async getComment(receptId) {
            let response = await Service.get(`/recepti/${receptId}/comments`);
            return response.data.map(doc => {
                return {
                    id: doc._id,
                    username: doc.username,
                    comment: doc.comment,
                    receptId: receptId
                };
            });
        },
    },

    add(novi_recept) {
        return Service.post('/recepti', novi_recept);
    },
    async dodajOcjenu(receptId, ocjena_recepta) {
        console.log("došao u service");
        await Service.patch(`/recepti/${receptId}`, ocjena_recepta);
    },
    async dodajFavorita(username, receptId, favorit) {
        console.log("dosao u service u dodajFavorita");
        await Service.post(`/users/${username}/${receptId}/favoriti`, favorit)
    },
    async getOne(id) {
        console.log("ulazim u backend")
        let response = await Service.get(`/recepti/${id}`);
        let doc = response.data;
        let avg = 0;
        let ocjena = doc.ocjena;

        if(!ocjena.length) console.log("nista");
        else {
            console.log(ocjena);
            avg = (ocjena.reduce((a,b) => (a+b)) / ocjena.length);
        }
        

        return {
            id: doc._id,
            url: doc.slika,
            username: doc.username,
            title: doc.naziv,
            kategorija: doc.inputKategorija,
            sastojci: doc.sastojci,
            priprema: doc.priprema,
            vrijeme: doc.vrijeme_pripreme,
            prosjek: avg
        };
    }, 
    async getAll(searchTerm) {
        let options = {};

        if (searchTerm) {
            options.params = {
                _any: searchTerm
            };
        }

        let response = await Service.get('/recepti', options);
        return response.data.map(doc => {
            return {
            id: doc._id,
            url: doc.slika,
            username: doc.username,
            title: doc.naziv,
                
            };
        });
    },
    async getMojiRecepti(username) {
        let response = await Service.get(`/recepti/username/${username}`);
        return response.data.map(doc => {
            return {
                id: doc._id,
                url: doc.slika,
                username: doc.username,
                title: doc.naziv,
            };
        });
    },
    async getMojiFavoriti(username) {
        let response = await Service.get(`/users/${username}/favoriti`);
        console.log(response);
            return response.data.map(doc => {
                return {
                    id: doc.receptidetails[0]._id,
                    url: doc.receptidetails[0].slika,
                    username: doc.receptidetails[0].username,
                    title: doc.receptidetails[0].naziv
                };
            });
    }
      
}

//objekt za provjeru tokena i dohvaćanje korisničkih podataka
let Auth = {
    async register(username, mail, password) {
        let response = await Service.post('/users', {
            username: username,
            mail: mail,
            password: password,
        });

        let user = response.data;
        localStorage.setItem('user', JSON.stringify(user));

        return true;
    },
    async login(username, password) {
        let response = await Service.post('/auth', {
            username: username,
            password: password,
        });

        let user = response.data;

        localStorage.setItem('user', JSON.stringify(user));

        return true;
    },
    async changePassword(promjena_lozinke) {
        try {
            await Service.patch('/users', promjena_lozinke);
            return true;
            console.log("change password u service");
        } catch (e) {
            console.log("Greška ", e);
        }
    },
    logout() {
        localStorage.removeItem('user');
    },
    //izvlači korisnika iz localStorage-a
    getUser() {
        return JSON.parse(localStorage.getItem('user'));  //vraća ga u objekt iz stringa
    },
    getToken() {
        let user = Auth.getUser();
        if (user && user.token) {
            return user.token;
        }
        else {
            return false;
        }
    },
    //provjerava da li smo autentificirani
    authenticated() {
        let user = Auth.getUser();
        if (user && user.token) {
            return true;
        }
        return false;
    },
    state: {
        get authenticated() {
            return Auth.authenticated();
        },
        get username() {
            let user = Auth.getUser();
            //console.log(user);
            if (user) {
                return user.username;
            }
        },
    },
};

export { Service, Recepti, Auth }; // exportamo Service za ručne pozive ili Recepti i Auth za metode