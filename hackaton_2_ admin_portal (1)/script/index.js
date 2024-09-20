import { auth, db } from "./config.js";
import { addDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const addStudentForm = document.querySelector('#add-student-form');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const cnicInput = document.querySelector('#cnic');
const userTypeInput = document.querySelector('#user-type');

const postNowButton = document.querySelector('#Post_Now_btn');
const postNowText = document.querySelector('#Post_Now_text');
const loadingSpinner = document.querySelector('#loading-spinner');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const generateUniqueRollNumber = async () => {
  let rollNumber;
  let isUnique = false;

  while (!isUnique) {
    rollNumber = Math.floor(1000 + Math.random() * 9000); 
    const rollNumberQuery = query(collection(db, 'users'), where('rollNumber', '==', rollNumber));
    const existingRollNumbers = await getDocs(rollNumberQuery);

    if (existingRollNumbers.empty) {
      isUnique = true;
    }
  }

  return rollNumber;
};

const checkCNICExists = async (cnic) => {
  const cnicQuery = query(collection(db, 'users'), where('cnic', '==', cnic));
  const cnicSnapshot = await getDocs(cnicQuery);
  return !cnicSnapshot.empty;
};

const resetButtonState = () => {
  postNowButton.disabled = false;
  postNowText.classList.remove('hidden'); 
  loadingSpinner.classList.add('hidden'); 
};

addStudentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const cnic = cnicInput.value.trim();
  const userType = userTypeInput.value;

  if (!emailRegex.test(email)) {
    alertify.error('Invalid email format');
    resetButtonState();
    return;
  }

  if (!cnicRegex.test(cnic)) {
    alertify.error('Invalid CNIC format');
    resetButtonState();
    return;
  }

  postNowButton.disabled = true;
  postNowText.classList.add('hidden');
  loadingSpinner.classList.remove('hidden');

  try {
    const cnicExists = await checkCNICExists(cnic);
    if (cnicExists) {
      alertify.error('CNIC already exists');
      resetButtonState();
      return;
    }

    const rollNumber = await generateUniqueRollNumber();

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, 'users'), {
      firstName,
      lastName,
      email,
      cnic,
      userType,
      uid: user.uid,
      rollNumber,
    });

    Swal.fire({
      title: 'Student Added!',
      text: `Roll Number: ${rollNumber}`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Copy Roll Number',
      cancelButtonText: 'Close',
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(rollNumber);
        alertify.success('Roll Number copied to clipboard');
      }
    });

    addStudentForm.reset();
  } catch (error) {
    alertify.error(`Error adding student: ${error.message}`);
  } finally {
    resetButtonState();
  }
});
