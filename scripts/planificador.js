// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { deleteDoc, addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const auth = getAuth(app);
const db = getFirestore(app);


// DOM references
const signOutButton = document.getElementById("home_signout");
const cardsDiv = document.getElementById("cards");
const quickSearch = document.getElementById("quick-search");
const recipeModal = document.getElementById("recipeModal");
// navbar elements
const navbar = document.getElementById("navbar-nav");
const navbarCol = navbar.children;
const signOutNav = navbarCol[5];
const signInNav = navbarCol[1];

// helper objects
const parser = new DOMParser();


var choosedRecipes = [];
var choosedNames = [];
var choosedPrice = 0;

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

    const lunesPlatos = document.getElementById("lunes-platos");
    const martesPlatos = document.getElementById("martes-platos");
    const miercolesPlatos = document.getElementById("miercoles-platos");
    const juevesPlatos = document.getElementById("jueves-platos");
    const viernesPlatos = document.getElementById("viernes-platos");

    let dias_list = [lunesPlatos,martesPlatos,miercolesPlatos,juevesPlatos,viernesPlatos];

    let nextDayList = ["martes","miercoles","jueves","viernes"]
    let nextDay = "";
    let index = -1;
    
    dias_list.forEach( function (platos) {

        platos.innerHTML = "";
        let showed_platos = [];
        let random = 0;
        const unsub = onSnapshot(collection(db, "platos"), (querySnapshot) => {
            index++;
            if(index < 4){  
                nextDay = nextDayList[index]; 
            }
            else{
                nextDay = "results"; 
            }
            for(let i = 0; i<3; i++){
                random = getRandomInt(querySnapshot.size);

                if(showed_platos.includes(random)){
                    i--;
                }
                else{
                    //OUTPUT DATA
                    let receta = querySnapshot.docs[random].data();
                    platos.innerHTML += `
                    <div class="col-sm-4 mb-3">
                        <div class="card w-100 mx-2 h-70 p-3">
                            <img src="${receta.thumbnail}" class="card-img-top" alt="...">
                            <div class="card-body">
                              <h5 class="card-title">${receta.recipeName}</h5>
                              <p class="card-text">${receta.description}</p>
                              <a 
                              id="${querySnapshot.docs[random].id}" 
                              href="#${nextDay}" 
                              class="btn btn-primary btn-view btn-choose" 
                              data-price="${receta.price}"
                              data-ingredients="${receta.ingredients}"
                              data-name="${receta.recipeName}" 
                              data-id="${querySnapshot.docs[random].id}"
                              >Escoger</a>
                            </div>
                        </div>
                    </div>
                    `;

                }
                showed_platos.push(random);
            }
        });
    });

    
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(1000); //wait

    document.querySelectorAll(".btn-choose").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            choosedPrice += parseInt(e.target.dataset.price); // suma precios
            choosedRecipes.push(e.target.dataset.id);
            choosedNames.push(e.target.dataset.name);

            await calcular(e.target.href.substr(e.target.href.length - 7));
        });
    });

    console.log("done")
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

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function calcular(pFlag){
    if(pFlag == "results"){
        console.log("calculando...");
        document.getElementById("res-precio").innerHTML = "$" + choosedPrice;

        for(let i = 0; i<choosedNames.length; i++){
            document.getElementById("res-platillos").innerHTML += "<p>" + choosedNames[i] + "</p>";
        }

        choosedRecipes.forEach(async id => {
            const docRef = doc(db, "platos", id);
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();

            let output_super = document.getElementById("res-super");

            data.ingredients.forEach(ingredient => {
                output_super.innerHTML += `
                <ol class="list-group" id="res-super">
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">${ingredient.ingredientName}</div>
                            ${ingredient.size.amount} ${ingredient.size.unit} 
                        </div>
                    </li>
                </ol>
                `;
            });
            
        });

    }
}