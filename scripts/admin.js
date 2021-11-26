import { signUp } from "./auth.js";

//Menu event listeners
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const statsBtn = document.getElementById("statsBtn");

addBtn.addEventListener("click", showAdd);
editBtn.addEventListener("click", showEdit);
statsBtn.addEventListener("click", showStats);

function showAdd(){
    addBtn.classList.add("active");
    editBtn.classList.remove("active");
    statsBtn.classList.remove("active");
    content.innerHTML = `
    <div class="w-100 bg-light p-5 rounded-3" style="height: 100%;">
    <div class="row">
        <h1>Añadir receta</h1>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vero adipisci explicabo quas illo velit provident voluptates quidem officia odio minus mollitia voluptatem, fuga maxime commodi culpa cumque error quibusdam dolorem?</p>
    </div>
    </div>
    `;
}

function showEdit(){
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

function showStats(){
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