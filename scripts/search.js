// search.js
// Busqueda avanzada
import { app } from "./index.js";
// firebase
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const db = getFirestore(app);

// DOM content
const inputIngredient = document.getElementById("inputIngredient");
const ingredientDiv = document.getElementById("ingredientDiv");

// Add behavior to textinputs
window.addEventListener("DOMContentLoaded", async (e) => {
    const textInputs = document.querySelectorAll("input[type=text]");
    textInputs.forEach(textIn => {
        // get corresponding toasts div
        const toastDiv = textIn.parentElement.nextElementSibling;
        // listen to user commit
        textIn.addEventListener("keydown", async (e) => {
            // only on ENTER
            if (e.key == "Enter") {
                const val = textIn.value;
                const toast = document.createElement('div');
                toast.className = "toast align-items-center show";
                toast.dataset.value = val;
                toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                    ${val}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>`;
                toastDiv.append(toast);

                toast.querySelector(".btn-close").addEventListener("click", async (e) => {
                    toast.remove();
                });
            }
        });
    });
});
