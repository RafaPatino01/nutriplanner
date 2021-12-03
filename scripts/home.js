// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const auth = getAuth(app);
const db = getFirestore(app);

const navbar = document.getElementById("navbar-nav");
const signOutButton = document.getElementById("home_signout");
const cardsDiv = document.getElementById("cards");
// navbar elements
const navbarCol = navbar.children;
const signOutNav = navbarCol[5];
const signInNav = navbarCol[1];

// helper objects
const parser = new DOMParser();

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

// on doc load
window.addEventListener("DOMContentLoaded", async () => {
    // Load in cards
    const platoDoc = await fetch("common/recipe_card.html")
    .then(response => response.text())
    .then(data => parser.parseFromString(data,"text/html"));
    const platoElem = platoDoc.body.firstElementChild;
    // console.log(platoElem);

    // Get realtime Recipes
    const unsub = onSnapshot(collection(db, "platos"), (querySnapshot) => {
        cardsDiv.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            // customize card to data
            const newCard = platoElem.cloneNode(true);
            newCard.querySelector(".card-title").innerText = data.recipeName;
            newCard.querySelector(".card-text").innerText = data.description;
            const viewBtn = newCard.querySelector(".btn-view");
            viewBtn.dataset.id = doc.id;
            // TODO: view event
            // viewBtn.addEventListener("click" , (e) => {});
            if (data.thumbnail) {
                // if available image update
                newCard.querySelector("img").src = data.thumbnail;
            }
            // finally, append card
            cardsDiv.append(newCard);
        });
    });
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
