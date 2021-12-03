// home.js
// index.html script
import { app } from "./index.js";
// firebase
import { collection, getFirestore, onSnapshot } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js";

// firebase app
const db = getFirestore(app);


// DOM references
const cardsDiv = document.getElementById("cards");
const quickSearch = document.getElementById("quick-search");
const recipeModal = document.getElementById("recipeModal");

// helper objects
const parser = new DOMParser();

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
        
        viewBtn.addEventListener("click" , (e) => {
            // Set modal data
            recipeModal.querySelector("#viewRecipeModalLabel").innerHTML = data.recipeName;
            recipeModal.querySelector("#recipeModalDescription").innerHTML = data.description;
            const modalLeft = recipeModal.querySelector("#recipeModalLeft");
            modalLeft.innerHTML = `
            <h6>Tiempo: </h6> <p>${data.time} min</p>
            <h6>Porciones: </h6> <p>${data.servings}</p>
            <h6>Ingredientes: </h6>
            <p>`;
            data.ingredients.forEach((ingredient, idx) => {
                modalLeft.innerHTML += `
                ${idx+1}. ${ingredient.ingredientName}, ${ingredient.size.amount} ${ingredient.size.unit} <br />`;
            });
            modalLeft.innerHTML += '</p>';

            recipeModal.querySelector("#recipeModalInstructions").innerHTML = data.steps;
            recipeModal.querySelector("#recipeModalPrice").innerHTML = `\$${data.price}`;

            if (data.thumbnail) {
                recipeModal.querySelector("img").src = data.thumbnail;
            }
        });
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

// Scroll searchbar to top on focus
quickSearch.querySelector("input").addEventListener("focus", async (e) => {
    quickSearch.scrollIntoView();
});
