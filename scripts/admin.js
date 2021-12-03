// admin.js
// dynamic content
import { app } from "./index.js";
// firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";
import { deleteDoc, addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";

// json schema validator
const Ajv = window.ajv2019;
const ajv = new Ajv();

//Menu event listeners
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const statsBtn = document.getElementById("statsBtn");
const signoutButton = document.getElementById("LogOutBtn");
const contentArea = document.getElementById("content");

// Modals
const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
const modalBody = document.getElementById("loadingModal").querySelector(".modal-body");
const modalBtn = document.getElementById("loadingModal").querySelector("button");

// helper objects
const parser = new DOMParser();

// Behav
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

// Reset loading modal
modalBtn.addEventListener("click", event => {
    modalBody.innerHTML = `<div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;
});

// onload content
var validate;
window.addEventListener("DOMContentLoaded", async () => {
    // start with edit enabled
    editBtn.click();
    editBtn.blur();

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

editBtn.addEventListener("click", async (e) => {
    editBtn.classList.add("active");
    addBtn.classList.remove("active");
    statsBtn.classList.remove("active");

    await fetch("../common/edit_menu.html")
    .then(response => response.text())
    .then((data) => {
        contentArea.innerHTML = data;
    })
    .catch((error) => {
        alert(error.message);
        return;
    });

    const results_menu = document.getElementById("results_menu");
    const searchBtn = document.getElementById("searchBtn");
    const inputSearch = document.getElementById("inputSearch");

    searchBtn.addEventListener("click", (e) => {
        const q = inputSearch.value.toLowerCase();

        const unsub = onSnapshot(collection(db, "platos"), (querySnapshot) => {
            results_menu.innerHTML = "";
            querySnapshot.forEach((doc) => {
                // query name
                const data = doc.data();
                if (!(data.recipeName.toLowerCase().includes(q))) {
                    // not matching, skip entry
                    return;
                }

                results_menu.innerHTML += `
                <div class="row bg-edit mb-2 p-3 rounded">
                    <div class="col-8"><h4>${doc.data().recipeName}<h4></div>
                    <div class="col-2 text-center border-end">
                        <a class="btn-edit btn btn-block" data-id="${doc.id}">Editar</a>
                    </div>
                    <div class="col-2 text-center border-start">
                        <a class="btn-delete btn btn-block" data-id="${doc.id}">Borrar</a>
                    </div>
                </div>
                `
            });
            //edit plato
            document.querySelectorAll(".btn-edit").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    unsub();
                    await editPlato(e.target.dataset.id);
                });
            });

            // delete plato
            document.querySelectorAll(".btn-delete").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    unsub();
                    await deletePlato(e.target.dataset.id);
                });
            });
        });
    });


    searchBtn.click(); //Show all results on start
});

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
    const inputImg = document.getElementById("inputImg");
    const imgPreview = document.getElementById("imgPreview");
    // preview image
    inputImg.addEventListener("change", async (e) => {
        const [imgData] = inputImg.files;
        if (imgData) {
            imgPreview.src = URL.createObjectURL(imgData);
        }
    });

    const ingredientBtn = document.getElementById("ingredientBtn");
    ingredientBtn.addEventListener("click", addIngredientFront);

    const btnReceta = document.getElementById("btnReceta");
    btnReceta.addEventListener("click", async () => {
        // call modal

        loadingModal.toggle();

        const recipeData = getForm();
        const valid = validate(recipeData)
        console.log(recipeData);
        if (!valid) {
            modalBody.innerHTML = `<p>${ajv.errorsText(validate.errors)}</p>`
            modalBtn.removeAttribute("disabled");
            return;
        }

        // Data valid
        // Send to server
        const docRef = await addDoc(collection(db, "platos"), recipeData);

        // send image data (if exists)
        const [imgData] = inputImg.files;
        if (imgData) {
            const imgType = imgData.type.split('/')[1];
            const fileName = docRef.id + "." + imgType;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, imgData);
            const downloadURL = await getDownloadURL(storageRef);
            // update doc entry
            await updateDoc(docRef, {
                thumbnail: downloadURL
            });
        }

        modalBody.innerHTML = "<p>Receta guardada!</p>"
        modalBtn.removeAttribute("disabled");

        document.getElementById("addForm").reset();
        document.getElementById("ingredientList").innerHTML = "";
    });

});

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

async function editPlato(pId) {
    // Assert data
    const docRef = doc(db, "platos", pId);
    const docSnap = await getDoc(docRef);
    if (!(docSnap.exists())) {
        alert("Document doesn't exist!");
        editBtn.click();
        return;
    }

    await fetch("../common/edit_view.html")
    .then(response => response.text())
    .then((data) => {
        contentArea.innerHTML = data;
    })
    .catch((error) => {
        alert(error.message);
        return;
    });
    // image preview
    const inputImg = document.getElementById("inputImg");
    const imgPreview = document.getElementById("imgPreview");
    // preview image
    inputImg.addEventListener("change", async (e) => {
        const [imgData] = inputImg.files;
        if (imgData) {
            imgPreview.src = URL.createObjectURL(imgData);
        }
    });

    //ADD INGREDIENT funcionalidad
    const ingredientBtn = document.getElementById("ingredientBtn");
    ingredientBtn.addEventListener("click", addIngredientFront);

    // ADD ID to html
    document.getElementById("title").innerHTML += ` <span class='text-muted text-small'>${pId}</span>`;
    document.getElementById("btnBack").addEventListener('click', (e) => {
        editBtn.click();
    });

    // FILL INPUTS        
    const data = docSnap.data();
    document.getElementById("inputName").value = data.recipeName;
    document.getElementById("inputDescr").value = data.description;
    document.getElementById("inputServings").value = data.servings;
    document.getElementById("inputTime").value = data.time;
    document.getElementById("inputPrecio").value = data.price;
    document.getElementById("inputSteps").value = replaceAll(data.steps, "<br />", "");

    for (let i = 0; i < data.tags.length; i++) {
        switch (data.tags[i]) {
            case "vegetarian":
                document.getElementById("vegetarian").checked = true;
                break;
            case "vegan":
                document.getElementById("vegan").checked = true;
                break;
            case "breakfast":
                document.getElementById("breakfast").checked = true;
                break;
            case "lunch":
                document.getElementById("lunch").checked = true;
                break;
            case "dinner":
                document.getElementById("dinner").checked = true;
                break;
        }
    }

    for (let i = 0; i < data.ingredients.length; i++) {
        let ingredientName = data.ingredients[i].ingredientName;
        let ingredientQty = data.ingredients[i].size.amount;
        let ingredientUnit = data.ingredients[i].size.unit;

        let ingredientDoc = parser.parseFromString(`
        <div class="ingredient-entry row mb-1" data-ingredient-name="${ingredientName}" data-ingredient-qty="${ingredientQty}" data-ingredient-unit="${ingredientUnit}">
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
    }

    // load image
    const imgUrl = data.thumbnail;
    if (imgUrl) {
        imgPreview.src = imgUrl;
    }

    // btn Update receta
    document.getElementById("btnReceta").addEventListener('click', async (e) => {

        //Show modal
        loadingModal.toggle();

        // Get data from form
        const recipeData = getForm();
        const valid = validate(recipeData)
        if (!valid) {
            modalBody.innerHTML = `<p>${ajv.errorsText(validate.errors)}</p>`
            modalBtn.removeAttribute("disabled");
            return;
        }

        //Update doc
        await setDoc(docRef, recipeData, { merge: true });

        // Update image
        const [imgData] = inputImg.files;
        if (imgData) {
            // first delete existing
            if (imgUrl) {
                const delRef = ref(storage, imgUrl);
                await deleteObject(delRef);
            }
            // upload new image
            // regenerate filename in case of type change
            const imgType = imgData.type.split('/')[1];
            const fileName = pId + "." + imgType;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, imgData);
            const downloadURL = await getDownloadURL(storageRef);
            // update doc entry
            await updateDoc(docRef, {
                thumbnail: downloadURL
            });
        }

        modalBody.innerHTML = "<p>Receta guardada!</p>"
        modalBtn.removeAttribute("disabled");
    });


}

async function deletePlato(pId) {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    //Show modal
    loadingModal.toggle();

    const docRef = doc(db, "platos", pId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()

    // Delete image
    if (data.thumbnail) {
        const delRef = ref(storage, data.thumbnail);
        await deleteObject(delRef);
    }
    // delete doc
    await deleteDoc(docRef);
    modalBody.innerHTML = "<p style='background-color=rgb(252, 101, 101)'>Receta eliminada!</p>"
    modalBtn.removeAttribute("disabled");

    await delay(500); //wait
    location.reload();
}




//Remove substring from string
function replaceAll(str, find, replace) {
    let escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

function addIngredientFront() {
    const ingredientName = document.getElementById("inputIngredientName").value;
    const ingredientQty = document.getElementById("inputIngredientQty").value;
    const ingredientUnit = document.getElementById("inputIngredientSelect").value;

    let ingredientDoc = parser.parseFromString(`
        <div class="ingredient-entry row mb-1" data-ingredient-name="${ingredientName}" data-ingredient-qty="${ingredientQty}" data-ingredient-unit="${ingredientUnit}">
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

    //Clean inputs
    document.getElementById("inputIngredientName").value = "";
    document.getElementById("inputIngredientQty").value = "";
}

function getForm() {
    // Add br to textarea
    const addLinebreaks = (anyString) => {
        return anyString.replaceAll("\n", "<br />\r\n");
    };

    // Get ingredients
    const ingredientes = Array.from(document.getElementsByClassName("ingredient-entry"));
    const ingredientsList = []; // [name, size]

    ingredientes.forEach((element) => {
        ingredientsList.push({
            ingredientName: element.dataset.ingredientName,
            size: {
                amount: Number(element.dataset.ingredientQty),
                unit: element.dataset.ingredientUnit
            }
        });
    });

    // Get form
    const inputName = document.getElementById("inputName").value;
    const inputTime = Number(document.getElementById("inputTime").value);
    const inputServings = parseInt(document.getElementById("inputServings").value);
    const inputDescr = document.getElementById("inputDescr").value;
    const inputSteps = addLinebreaks($("#inputSteps").val());
    const inputPrecio = Number(document.getElementById("inputPrecio").value);

    // Get tag
    let tags = [];
    if (document.getElementById("vegetarian").checked) {
        tags.push("vegetarian");
    }
    if (document.getElementById("vegan").checked) {
        tags.push("vegan");
    }
    if (document.getElementById("breakfast").checked) {
        tags.push("breakfast");
    }
    if (document.getElementById("lunch").checked) {
        tags.push("lunch");
    }
    if (document.getElementById("dinner").checked) {
        tags.push("dinner");
    }

    let recipeData = {
        recipeName: inputName,
        time: inputTime,
        servings: inputServings,
        description: inputDescr,
        price: inputPrecio,
        steps: inputSteps,
        ingredients: ingredientsList,
        tags: tags
    };
    return recipeData;
}
