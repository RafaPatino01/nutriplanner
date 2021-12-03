// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { collection, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const auth = getAuth(app);
const db = getFirestore(app);

const navbar = document.getElementById("navbar-nav");
const signOutButton = document.getElementById("home_signout");
// navbar elements
const navbarCol = navbar.children;
const signOutNav = navbarCol[5];
const signInNav = navbarCol[1];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        // Enable signout
        signOutNav.removeAttribute("hidden");
        // Change signIn for user banner
        signInNav.innerHTML = `
        <a href="#" class="nav-link">
            <i class="fas fa-user"></i>
            <span class="link-text">${user.displayName}</span>
        </a>
        `;
        // check for admin
        const uid = user.uid;
        const querySnapshot = await getDocs(query(collection(db, "admin_users"), where("u_id", "==", uid)));
        if (!(querySnapshot.empty)) {
            console.log("Admin account");
            // add Admin panel nav
            const adminNav = document.createElement("li");
            adminNav.className = "nav-item";
            adminNav.innerHTML = `
            <a href="pages/index_admin.html" class="nav-link">
                <i class="fas fa-toolbox"></i>
                <span class="link-text">Admin panel</span>
            </a>`;
            signInNav.after(adminNav);
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
