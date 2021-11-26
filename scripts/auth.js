import app from "./index.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js"
import { getFirestore, collection, addDoc, getDocs, getDoc, onSnapshot, deleteDoc, doc, updateDoc} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-firestore.js"

const auth = getAuth(app);
const db = getFirestore(app);

//Get admin users from DB
let admin_users = [];
const onGetAdmin_users = (callback) => onSnapshot(collection(db, "admin_users"), callback);
onGetAdmin_users((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        admin_users.push(doc.data().u_id);
    });

    // is login file
    const login_file = document.getElementById("login_file");
    // is admin file
    const admin_file = document.getElementById("admin_file");
    
    //Login event listener
    const LoginButton = document.getElementById("LogBtn");
    if(LoginButton){
        LoginButton.addEventListener("click", logIn);
    }
    //LogOut event listener
    const LogOutButton = document.getElementById("LogOutBtn");
    if(LogOutButton){
        LogOutButton.addEventListener("click", logOut);
    }

    //SignIn Function
    function logIn(){
        let email = document.getElementById("email").value;
        let password = document.getElementById("pass").value;

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;

            //Check if admin
            if(admin_users.includes(user.uid)){
                console.log("logged admin");
                window.location.replace("index_admin.html");
            }
            else{
                console.log("logged normal user");
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }

    function logOut(){ 
        signOut(auth).then(() => {
            // Sign-out successful.
            window.location.replace("login.html");
        }).catch((error) => {
            // An error happened.
            console.log("error sign out");
        });    
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            const uid = user.uid;
            console.log("User is signed in: " + uid);
            
            if(login_file){
                console.log("loginfile");
                if(admin_users.includes(user.uid)){
                    window.location.replace("index_admin.html");
                }
            }
            if(admin_file){
                console.log("admin file");
                if(!admin_users.includes(user.uid)){
                    window.location.replace("../index.html");
                }
            }

        } else {
            console.log("User is signed out");
            if(admin_file){
                window.location.replace("login.html");
            }
        }
    });

});

function signUp(pEmail, pPass){
    createUserWithEmailAndPassword(auth, pEmail, pPass)
    .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    alert("Usuario correctamente registrado");
    window.location.replace("../index.html");
    })
    .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    });
}

export { signUp };

