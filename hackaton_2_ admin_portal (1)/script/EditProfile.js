import { auth, db } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, updateDoc, collection, getDocs, query, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const editProfileForm = document.querySelector('#edit-profile-form');
const updateProfileButton = document.querySelector('#update-profile-btn');
const loadingSpinner = document.querySelector('#loading-spinner');

const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

async function populateForm(uid) {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            document.querySelector('#cnic_input').value = userData.cnic || '';
            document.querySelector('#first_name_input').value = userData.firstName || '';
            document.querySelector('#last_name_input').value = userData.lastName || '';
        }
    });
}

async function isCNICTaken(cnic, uid) {
    const q = query(collection(db, "users"), where("cnic", "==", cnic), where("uid", "!=", uid));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

async function updateCNICInMarksCollection(oldCnic, newCnic) {
    const q = query(collection(db, "marks"), where("cnic", "==", oldCnic));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        const docRef = doc.ref;
        batch.update(docRef, { cnic: newCnic });
    });
    await batch.commit();
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        await populateForm(uid);
    } else {
        window.location = 'index.html';
    }
});

editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cnic = document.querySelector('#cnic_input').value.trim();
    const firstName = document.querySelector('#first_name_input').value.trim();
    const lastName = document.querySelector('#last_name_input').value.trim();
    if (!cnicRegex.test(cnic)) {
        alertify.error('Invalid CNIC format');
        updateProfileButton.disabled = false;
        loadingSpinner.classList.add('hidden');
        return;
    }
    if (!cnic || !firstName || !lastName) {
        alertify.error('Please fill out all fields.');
        return;
    }
    updateProfileButton.disabled = true;
    loadingSpinner.classList.remove('hidden');
    try {
        const user = auth.currentUser;
        if (user) {
            const uid = user.uid;
            const cnicTaken = await isCNICTaken(cnic, uid);
            if (cnicTaken) {
                alertify.error('This CNIC is already taken by another user.');
                return;
            }
            const q = query(collection(db, "users"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            let oldCnic = '';
            querySnapshot.forEach(async (doc) => {
                if (doc.exists()) {
                    oldCnic = doc.data().cnic;
                    const userDoc = doc.ref;
                    await updateDoc(userDoc, {
                        cnic: cnic,
                        firstName: firstName,
                        lastName: lastName
                    });
                }
            });
            if (oldCnic) {
                await updateCNICInMarksCollection(oldCnic, cnic);
            }
            alertify.success('Profile updated successfully.');
        }
    } catch (error) {
        console.error('Error updating profile: ', error);
        alertify.error('Error: ' + error.message);
    } finally {
        updateProfileButton.disabled = false;
        loadingSpinner.classList.add('hidden');
    }
});
