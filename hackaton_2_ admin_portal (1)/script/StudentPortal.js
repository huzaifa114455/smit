import { auth, db } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const fetchResultForm = document.querySelector('#fetch-result-form');
const resultSection = document.querySelector('#result_section');
const logoutButton = document.querySelector('#logout-btn');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        console.log(uid);
    } else {
        window.location = 'index.html';
    }
});

fetchResultForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cnic = document.querySelector('#cnic_input').value.trim();
    
    if (!cnic) {
        alertify.error('Please enter a CNIC number.');
        return;
    }

    try {
        const marksCollection = collection(db, 'marks');
        const q = query(marksCollection, where('cnic', '==', cnic));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            let resultsHTML = '';
            querySnapshot.forEach((doc) => {
                const marksData = doc.data();
                resultsHTML += `
                    <div class="card rounded-lg overflow-hidden shadow-lg mb-4">
                        <div class="card-header">
                            Marks for CNIC: ${cnic}
                        </div>
                        <div class="card-body">
                            <p><strong>Course:</strong> ${marksData.course}</p>
                            <p><strong>Roll Number:</strong> ${marksData.rollNumber}</p>
                            <p><strong>Marks:</strong> ${marksData.marks}</p>
                            <p><strong>Total Marks:</strong> ${marksData.totalMarks}</p>
                            <p><strong>Grade:</strong> ${marksData.grade}</p>
                        </div>
                    </div>
                `;
            });
            resultSection.innerHTML = resultsHTML;
        } else {
            resultSection.innerHTML = `
                <div class="alert alert-error">
                    No marks found for the provided CNIC.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching marks: ', error);
        alertify.error('Error: ' + error.message);
    }
});

logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location = 'index.html';
    } catch (error) {
        console.error('Error signing out: ', error);
        alertify.error('Error: ' + error.message);
    }
});
