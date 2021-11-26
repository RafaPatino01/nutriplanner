import { signUp } from "./auth.js";
//register event listener
const RegisterButton = document.getElementById("Register");
if(RegisterButton){
    RegisterButton.addEventListener("click", registerForm);
}
const RegisterForm = document.getElementById("register_form");
RegisterForm.style.opacity = 0;

function registerForm(){
    console.log("register clicked");
    const RegisterForm = document.getElementById("register_form");
    const LoginForm = document.getElementById("login_form");

    RegisterForm.style.opacity = 1;
    LoginForm.style.display = "none";
    RegisterForm.innerHTML = `
    <div class="col-sm-6 p-5 border-end text-center">
    <img class="h-100" src="https://via.placeholder.com/300">
    </div>

    <div class="col-sm-6 p-3">
    <h3 class="w-100 text-center">Regístrate</h3>
    <div class="row px-5 m-3">
        <label>Nombre</label>
        <input type="text" class="form-control">
    </div>
    <div class="row px-5 m-3">
        <label>Email</label>
        <input type="text" class="form-control" id="register_email">
    </div>
    <div class="row px-5 m-3">
        <label>Contraseña</label>
        <input type="password" class="form-control" id="register_pass0">
    </div>
    <div class="row px-5 m-3">
        <label>Confirmar contraseña</label>
        <input type="password" class="form-control" id="register_pass1">
    </div>
    <div class="row px-5 m-3">
        <button class="btn btn-primary mt-3" id="SignUpBtn">Registrarse</button>
    </div>
    <span class="px-5 m-3"><a class="text-muted" href="login.html" >Ya tengo cuenta</a></span>
    <br><br>
    </div>`;

    const SignUpButton = document.getElementById("SignUpBtn");
    SignUpButton.addEventListener("click", registerUser);
}

function registerUser(){
    let email = document.getElementById("register_email").value;
    let pass0 = document.getElementById("register_pass0").value;
    let pass1 = document.getElementById("register_pass1").value;

    let msg = "";
    if(!(email.length > 2) || !email.includes("@") || !email.includes(".")){
        msg = "\n - Ingresa un email válido";
    }
    if(!(pass0.length > 5)){
        msg += "\n - La contraseña debe tener al menos 6 caracteres";
    }
    if(pass0 != pass1){
        msg += "\n - Las contraseñas no coinciden";
    }

    if(msg==""){
        signUp(email, pass0);
    }
    else{
        alert(msg);
    }

}