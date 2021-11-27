// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"

const auth = getAuth(app);

const signOutButton = document.getElementById("home_signout");

// Disable button if no user
onAuthStateChanged(auth, (user) => {
    if (!user) {
        signOutButton.disabled = true;
    }
});

signOutButton.addEventListener("click", (e) => {
    signOut(auth)
    .then(() => {
        // sign-out successfull
        console.log("User signed out");
        signOutButton.blur();
    })
    .catch((error) => {
        // an error happened
        console.error(error);
    })
});
