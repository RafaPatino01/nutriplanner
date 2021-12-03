// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const auth = getAuth(app);
const db = getFirestore(app);


// DOM references
const signOutButton = document.getElementById("home_signout");
const cardsDiv = document.getElementById("cards");
const quickSearch = document.getElementById("quick-search");
// navbar elements
const navbar = document.getElementById("navbar-nav");
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
            createCard(doc);
        });

        quickSearch.querySelector("input").addEventListener("input", async (e) => {
            const searchText = e.target.value;
            const regex = new RegExp(searchText, 'gi');
            cardsDiv.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const rawData = JSON.stringify(data);
                if (regex.test(rawData)) {
                    // create card
                    const card = createCard(doc);
                    const titleText = card.querySelector(".card-title");
                    const bodyText = card.querySelector(".card-text");
                    titleText.innerHTML = HTMLhighlight(titleText.innerHTML, regex);
                    bodyText.innerHTML = HTMLhighlight(bodyText.innerHTML, regex);
                }
            });
        });
    });

    function createCard(doc) {
        const data = doc.data();
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
        return newCard;
    }
});

function HTMLhighlight(text, regexp) {
    let newText = text.replace(/(<mark>|<\/mark>)/gim, '');
    if (String(regexp) == '/(?:)/gi') return newText;
    newText = newText.replace(regexp, '<mark>$&</mark>');
    return newText;
}

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

// Scroll searchbar to top on focus
quickSearch.querySelector("input").addEventListener("focus", async (e) => {
    quickSearch.scrollIntoView();
});
