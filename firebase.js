// FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyAOsghOEPYUmr1L-y8iX0feFau79dcxfBQ",
    authDomain: "coquo-pat.firebaseapp.com",
    projectId: "coquo-pat",
    storageBucket: "coquo-pat.firebasestorage.app",
    messagingSenderId: "230128169014",
    appId: "1:230128169014:web:71be33fe9ee35c7e1aa897"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ui = new firebaseui.auth.AuthUI(auth);

const profilePic = document.querySelector("#profile-img");

var DB = {
    descriptors: null,
    ui: ui,

    register: function(router) {
        auth.onAuthStateChanged(user => {
            if (user == null)
            {
                profilePic.src = "";
                profilePic.style.display = "none";

                router.goto("#/signin");

                console.log("No user signed in");
            }
            else
            {
                profilePic.src = user.photoURL;
                profilePic.style.display = "block";

                if (router.route == "#/signin")
                    router.goto("#/home");

                console.log("User signed in:", user.displayName);
            }
        });
    },

    register_auth_container: function(container) {

        const uiConfig = {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    console.log("User signed in:", authResult.user.displayName);
                    return false; // Prevent redirect
                }
            },
            signInFlow: 'popup'
        };

        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                ui.start(container, uiConfig);
            });
    },

    is_logged: function() {
        return auth.currentUser != null;
    },

    logout: function() {
        console.log("Signing out");
        auth.signOut();
    },

    get_descriptor: function(hash) {
        if (DB.descriptors != null)
        {
            return new Promise((resolve) => { resolve(DB.descriptors.find(desc => desc.hash == hash)); });
        }

        return db.collection("descriptors").doc(hash).get()
            .then((doc) => {
                if (!doc.exists)
                    throw new Error("Descriptor not found");
                let desc = doc.data()
                desc.hash = doc.id;
                return desc;
            })
    },

    get_descriptors: function() {
        if (DB.descriptors != null)
        {
            return new Promise((resolve) => { resolve(DB.descriptors); });
        }

        return db.collection("descriptors").get()
            .then((querySnapshot) => {
                DB.descriptors = [];
                querySnapshot.forEach((doc) => {
                    let desc = doc.data();
                    desc.hash = doc.id;
                    DB.descriptors.push(desc);
                });

                return DB.descriptors;
            })
            .catch((error) => {
                console.error("Error getting recipe descriptors:", error);
                return null;
            });
    },

    get_recipe: function(hash) {
        let desc, recipe;
        return DB.get_descriptor(hash)
            .then((doc) => {
                desc = doc;
            })
            .then(() => db.collection("recipes").doc(hash).get())
            .then((doc) => {
                if (!doc.exists)
                    throw new Error("Recipe not found");
                recipe = doc.data();
            })
            .then(() => { return { desc, recipe }; })
            .catch((error) => {
                console.error("Error getting recipe (TODO: stale descriptor, erase it):", error);
            });
    },

    get_recipes: function(hashes) {

        return db.collection("recipes")
            .where(firebase.firestore.FieldPath.documentId(), "in", hashes)
            .get()
    },

    set_recipe: function(hash, desc, recipe) {
        // Clear cache
        DB.descriptors = null;

        return db.collection("descriptors").doc(hash).set(desc)
            .catch((error) => {
                console.error("Error writing desc: ", error);
            })
            .then(() => db.collection("recipes").doc(hash).set(recipe))
            .catch((error) => {
                console.error("Error writing recipe:", error);
            });
    },

    delete_recipe: function(hash) {
        // Clear cache
        DB.descriptors = null;

        return db.collection("recipes").doc(hash).delete()
            .then(() => db.collection("descriptors").doc(hash).delete())
    },
};
