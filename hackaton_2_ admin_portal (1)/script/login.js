import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth, db, storage } from "./config.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const from_dt = document.querySelector('#from_dt')
const Email_dt = document.querySelector('#Email_dt')
const password_dt = document.querySelector('#password_dt')


alertify.set('notifier', 'position', 'top-center');



// register btn loader
const registerBtn = document.querySelector('#register-btn');
const registerText = document.querySelector('#register-text');
const loadingSpinner = document.querySelector('#loading-spinner');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex = /^.{6,}$/;


from_dt.addEventListener('submit', async (e) => {
    e.preventDefault()
    registerText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    registerBtn.disabled = true;

    if (!emailRegex.test(Email_dt.value)) {
        console.error('Invalid email format');
        alertify.error('Invalid email format');

        resetButton()
        return;
    }
    if (!passwordRegex.test(password_dt.value)) {
        console.error('Password must be at least 6 characters long');
        alertify.error('Password must be at least 6 characters long');

        resetButton()
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, Email_dt.value, password_dt.value);
        const user = userCredential.user;
        console.log(user);
        alertify.success('Successfully login');
        setTimeout(function() {
            window.location = 'StudentPortal.html'
        }, 1000);
        from_dt.reset();
      
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        alertify.error(errorMessage);
        resetButton()
    } finally {
        resetButton()
   
    }


})



function resetButton() {
    registerText.classList.remove('hidden');
    loadingSpinner.classList.add('hidden');
    registerBtn.disabled = false;
}