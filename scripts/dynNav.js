// dynNav.js
// Changes navbar on user session
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { collection, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const auth = getAuth(app);
const db = getFirestore(app);

// navbar elements
const navbar = document.getElementById("navbar-nav");
const navbarCol = navbar.children;
const signInNav = navbarCol[1];
const userNav = navbarCol[2];
const adminNav = navbarCol[3];
const signOutNav = navbarCol[7];
const signOutButton = document.getElementById("home_signout");


onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        // Enable signout
        signOutNav.removeAttribute("hidden");
        // Change signIn for user banner
        userNav.querySelector("span").innerHTML = String(user.displayName);
        signInNav.setAttribute("hidden",'');
        userNav.removeAttribute("hidden");
        // check for admin
        const uid = user.uid;
        const querySnapshot = await getDocs(query(collection(db, "admin_users"), where("u_id", "==", uid)));
        if (!(querySnapshot.empty)) {
            console.log("Admin account");
            // add Admin panel nav
            adminNav.removeAttribute("hidden");
        }
    } else {
        // User is signed out
    }
});


signOutButton.addEventListener("click", async (e) => {
    signOut(auth)
    .then(() => {
        // sign-out successfull
        console.log("User signed out");
    })
    .catch((error) => {
        // an error happened
        alert(error.message);
        console.error(error);
    })
});
