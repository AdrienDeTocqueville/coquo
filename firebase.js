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

auth.onAuthStateChanged(user => {
    if (user == null)
    {
        let signIn = document.querySelector("#firebaseui-auth-container");
        signIn.style.display = "block";

        ui.start('#firebaseui-auth-container', uiConfig);
    }
    else
    {
        let profilePic = document.querySelector("#profile-img");
        profilePic.src = user.photoURL;
        profilePic.style.display = "block";

        console.log("User signed in:", user.displayName);
    }
});

var DB = {
    descriptors: null,

    load_descriptors: function() {
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
        return db.collection("descriptors").doc(hash).get()
            .then((doc) => {
                if (!doc.exists)
                    throw new Error("Descriptor not found");
                desc = doc.data();
            })
            .then(() => db.collection("recipes").doc(hash).get())
            .then((doc) => {
                if (!doc.exists)
                    throw new Error("Recipe not found");
                recipe = doc.data();

                for (let step of recipe.steps)
                {
                    if (step.notes == undefined)
                        step.notes = []
                }
            })
            .then(() => { return { desc, recipe }; })
            .catch((error) => {
                console.error("Error getting recipe (TODO: stale descriptor, erase it):", error);
            });
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
