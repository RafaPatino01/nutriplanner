// admin.js
// dynamic content
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// json schema validator
const Ajv = window.ajv2019;
const ajv = new Ajv ({loadSchema : async (uri) => {
    const res = await request.json(uri);
    if (res.statusCode >= 400) throw new Error("Loading error: " + res.StatusCode);
    return res.body;
}});

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

// onload content
var validate;
window.addEventListener("DOMContentLoaded", async () => {
    // start with add enabled
    addBtn.click();
    addBtn.blur();

    // setup ajv
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
        console.error(error);
    });
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
        const ingredientName = document.getElementById("inputIngredientName").value;
        const ingredientQty = document.getElementById("inputIngredientQty").value;
        const ingredientUnit = document.getElementById("inputIngredientSelect").value;

        // ingredient entries
        // ingredient class to fetch all later
        // could also be read from ajax
        let ingredientDoc = parser.parseFromString(`
            <div class="ingredient-entry row mb-1" data-ingredient-name=${ingredientName} data-ingredient-qty=${ingredientQty} data-ingredient-unit=${ingredientUnit}>
                <div class="col-6 border bg-white rounded">
                    ${ingredientName}
                </div>
                <div class="col-2 border bg-white rounded-end" >
                    ${ingredientQty}
                </div>
                <div class="col-2 border bg-white rounded" >
                    ${ingredientUnit}
                </div>
                <div class="col-2 text-center">
                    <a class="btn-delete btn bg-gray" aria-label="Delete">
                        <i class="bi bi-x-circle"></i>
                    </a>
                </div>
            </div>
            `,
            "text/html");
        // get only div
        const ingredientElement = ingredientDoc.body.firstElementChild;
        // delete self
        ingredientElement.querySelector(".btn-delete")
        .addEventListener("click", () => {
            ingredientElement.remove();
        });
        // insert into doc
        document.getElementById("ingredientList").append(ingredientElement);
    });
    
    
    const btnReceta = document.getElementById("btnReceta");
    btnReceta.addEventListener("click", () => {
        // Get ingredients
        const ingredientes = Array.from(document.getElementsByClassName("ingredient-entry"));
        const ingredientsList = []; // [name, size]

        ingredientes.forEach((element) => {
            ingredientsList.push({
                ingredientName: element.dataset.ingredientName,
                size: {
                    amount: element.dataset.ingredientQty,
                    unit: element.dataset.ingredientUnit
                }
            });
        });
        
        // Get form
        const inputName = document.getElementById("inputName").value;
        const [inputImg] = document.getElementById("inputImg").files;
        var imgPath = "";
        if (inputImg) {
            imgPath = URL.createObjectURL(inputImg);
        }
        const inputTime = document.getElementById("inputTime").value;
        const inputServings = document.getElementById("inputServings").value;
        const inputDescr = document.getElementById("inputDescr").value;
        
        // Get tag
        let tags = [];
        if(document.getElementById("vegetarian").checked){
            tags.push("vegetarian");
        } 
        if(document.getElementById("vegan").checked){
            tags.push("vegan");
        } 
        if(document.getElementById("breakfast").checked){
            tags.push("breakfast");
        } 
        if(document.getElementById("lunch").checked){
            tags.push("lunch");
        } 
        if(document.getElementById("dinner").checked){
            tags.push("dinner");
        }

        document.getElementById("test-output").innerHTML = 
        `
        <p>Name: ${inputName}</p>
        <p>img: ${imgPath}</p>
        <p>Time: ${inputTime}</p>
        <p>Servings: ${inputServings}</p>
        <p>Descr: ${inputDescr}</p>
        <p>Ingredients: ${ingredientsList}</p>
        <p>Tags: ${tags}</p>
        `;
    });

});

function showEdit() {
    editBtn.classList.add("active");
    addBtn.classList.remove("active");
    statsBtn.classList.remove("active");
    contentArea.innerHTML = `
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
    contentArea.innerHTML = `
    <div class="w-100 bg-light p-5 rounded-3" style="height: 100%;">
    <div class="row">
        <h1>Estadísticas</h1>
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rem quia pariatur itaque natus vero veritatis ut, quisquam cumque odit obcaecati ratione quos aperiam, eligendi accusamus neque minus esse quas enim!</p>
    </div>
    </div>
    `;
}
