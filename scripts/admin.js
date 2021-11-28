// admin.js
// dynamic content
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// json schema validator
const Ajv = window.ajv2019;
const ajv = new Ajv ();

//Menu event listeners
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const statsBtn = document.getElementById("statsBtn");
const signoutButton = document.getElementById("LogOutBtn");
const contentArea = document.getElementById("content");

// helper objects
const parser = new DOMParser();

// Behav
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        // check for admin
        const uid = user.uid;
        const querySnapshot = await getDocs(query(collection(db, "admin_users"), where("u_id", "==", uid)));
        if (!(querySnapshot.empty)) {
            console.log("Admin account");
        } else {
            console.log("Invalid account");
            window.location.assign("../");
        }
    } else {
        // no user
        console.log("No user");
        // redirect home
        window.location.assign("../");
    }
});

signoutButton.addEventListener("click", () => {
    signOut(auth)
    .then(() => {
        // sign-out successfull
        // redirect to home
        console.log("admin signed out");
        window.location.assign("../");
    })
    .catch((error) => {
        // an error happened
        console.error(error);
        alert(error.message);
    });
});

// addBtn.addEventListener("click", showAdd);
editBtn.addEventListener("click", showEdit);
statsBtn.addEventListener("click", showStats);

addBtn.addEventListener("click", async (e) => {
    addBtn.classList.add("active");
    editBtn.classList.remove("active");
    statsBtn.classList.remove("active");

    await fetch("../common/add_plato.html")
    .then(response => response.text())
    .then((data) => {
        // // se pueden modificar los elementos html
        // // antes de agregarlos con un parser
        // const htmlDoc = parser.parseFromString(data, "text/html");
        // // do stuff ..
        // contentArea.innerHTML = XMLS.parseFromString(htmlDoc);
        contentArea.innerHTML = data;
    })
    .catch((error) => {
        alert(error.message);
    });

    const ingredientBtn = document.getElementById("ingredientBtn");
    ingredientBtn.addEventListener("click", () => {
        const value = document.getElementById("inputIngredient").value;

        // ingredient entries
        // ingredient class to fetch all later
        // could also be read from ajax
        let ingredientDoc = parser.parseFromString(`
            <div class="ingredient-entry row mb-1" data-value=${value}>
                <div class="col-10 border bg-white rounded">
                    ${value}
                </div>
                <div class="col-2 text-center">
                    <a class="btn-delete btn btn-gray" aria-label="Delete">
                        <i class="bi bi-x-circle"></i>
                    </a>
                </div>
            </div>
            `,
            "text/html");
        // get only div
        let ingredientElement = ingredientDoc.body.firstElementChild;
        // delete self
        ingredientElement.querySelector(".btn-delete")
        .addEventListener("click", () => {
            ingredientElement.remove();
        });
        // insert into doc
        document.getElementById("ingredientList").append(ingredientElement);
    });
});

function showEdit() {
    editBtn.classList.add("active");
    addBtn.classList.remove("active");
    statsBtn.classList.remove("active");
    content.innerHTML = `
    <div class="w-100 bg-light p-5 rounded-3" style="height: 100%;">
    <div class="row">
        <h1>Editar receta</h1>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vero adipisci explicabo quas illo velit provident voluptates quidem officia odio minus mollitia voluptatem, fuga maxime commodi culpa cumque error quibusdam dolorem?</p>
    </div>
    </div>
    `;
}

function showStats() {
    statsBtn.classList.add("active");
    editBtn.classList.remove("active");
    addBtn.classList.remove("active");
    content.innerHTML = `
    <div class="w-100 bg-light p-5 rounded-3" style="height: 100%;">
    <div class="row">
        <h1>Estadísticas</h1>
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rem quia pariatur itaque natus vero veritatis ut, quisquam cumque odit obcaecati ratione quos aperiam, eligendi accusamus neque minus esse quas enim!</p>
    </div>
    </div>
    `;
}

// onload content
window.addEventListener("DOMContentLoaded", async () => {
    // start with add enabled
    addBtn.click();
    addBtn.blur();

    // setup ajv
    var validate;
    await fetch('../schemas/size-schema.json')
    .then(response => response.json())
    .then(sizeSchema => {
        ajv.addSchema(sizeSchema);
        return fetch('../schemas/plato-schema.json');
    })
    .then(response => response.json())
    .then(platoSchema => {
        validate = ajv.compile(platoSchema);
    })
    .catch(error => {
        alert(error);
    });

    
});
