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
    <div class="w-100 bg-light p-5 rounded-3">
    <div class="row">
        <h1>Añadir receta</h1>
        <br>
        <p class="text-small">Añade nuevas recetas para que estén disponibles en la plataforma</p>
        <br>
        <form class="p-5">
        <div class="row mb-3">
            <label for="inputName" class="col-sm-2 col-form-label">Nombre</label>
            <div class="col-sm-10">
            <input type="text" class="form-control" id="inputName">
            </div>
        </div>
        <div class="row mb-3">
            <label for="inputDescr" class="col-sm-2 col-form-label">Descripción</label>
            <div class="col-sm-10">
            <input type="text" class="form-control" id="inputDescr">
            </div>
        </div>
        <div class="row mb-3">
            <label for="inputDescr" class="col-sm-2 col-form-label">Precio</label>
            <div class="col-sm-10">
            <input type="text" class="form-control" id="inputDescr">
            </div>
        </div>
        <div class="row mb-3">
            <label for="formFile" class="col-sm-2 col-form-label">Imagen</label>
            <div class="col-sm-10">
            <input class="form-control" type="file" id="inputFile">
            </div>
        </div>
        <fieldset class="row mb-3">
            <legend class="col-form-label col-sm-2 pt-0">Tipo</legend>
            <div class="col-sm-10">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="gridRadios" id="normal" value="option1" checked>
                <label class="form-check-label" for="gridRadios1">
                Normal
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="gridRadios" id="vegetarian" value="option2">
                <label class="form-check-label" for="gridRadios2">
                Vegetariano
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="gridRadios" id="vegan" value="option3">
                <label class="form-check-label" for="gridRadios3">
                Vegano
                </label>
            </div>
            </div>
        </fieldset>
        <hr>
        <div class="row mb-3">
            <label for="inputIngredient" class="col-sm-2 col-form-label">Añadir ingredientes</label>
            <div class="col-sm-5">
            <input type="text" class="form-control" id="inputIngredient">
            </div>
            <div class="col-sm-5">
            <button type="button" class="btn btn-primary" id="ingredientBtn">Agregar</button>
            </div>
        </div>
        <div class="row mb-3">
            <label class="col-sm-2 col-form-label"></label>
            <div class="col-sm-5 p-3">
                <div class="row" id="ingredientList">
                </div>
            </div>
        </div>

        <button type="submit" class="mt-3 btn btn-lg btn-primary">Añadir receta</button>
        </form>
    </div>
    </div>`;

    //Form ingredients
    let ingredientBtn = document.getElementById("ingredientBtn");
    let value = "";
    let n_ingredient = 0;
    ingredientBtn.addEventListener("click", function addIngredients(){
        value = document.getElementById("inputIngredient").value;

        document.getElementById("ingredientList").innerHTML += `
        <div class="row mb-1" id="ingredient`+n_ingredient.toString()+`">
        <div class="col-10 border bg-white rounded">`+value+`</div>
        <div class="col-2 text-center"><a class="btn bg-gray" onclick="document.getElementById('ingredient'+`+n_ingredient.toString()+`).innerHTML = '';">ⓧ</a></div>
        </div>
        `;

        n_ingredient++;
    });
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
