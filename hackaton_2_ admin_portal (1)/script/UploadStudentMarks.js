import { db } from "./config.js"; 
import { addDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const uploadMarksForm = document.querySelector('#upload-marks-form');

const checkRollNumberExists = async (rollNumber) => {
    try {
        const rollNumberAsNumber = Number(rollNumber);
        const studentQuery = query(collection(db, 'users'), where('rollNumber', '==', rollNumberAsNumber));
        const studentSnapshot = await getDocs(studentQuery);
        return !studentSnapshot.empty; 
    } catch (error) {
        console.error('Error checking roll number existence:', error);
        return false;
    }
};

const getCNICByRollNumber = async (rollNumber) => {
    try {
        const rollNumberAsNumber = Number(rollNumber);
        const studentQuery = query(collection(db, 'users'), where('rollNumber', '==', rollNumberAsNumber));
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            return studentDoc.data().cnic; 
        }
        return null;
    } catch (error) {
        console.error('Error retrieving CNIC:', error);
        return null;
    }
};

uploadMarksForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const course = document.querySelector('#course').value.trim();
    const rollNumber = document.querySelector('#student-id').value.trim(); 
    const marks = Number(document.querySelector('#marks').value);
    const totalMarks = Number(document.querySelector('#total-marks').value);
    const grade = document.querySelector('#grade').value.trim();

    try {
        const exists = await checkRollNumberExists(rollNumber);
        if (!exists) {
            alertify.error('Roll number does not exist. Please add the student first.');
            return;
        }

        const cnic = await getCNICByRollNumber(rollNumber);
        if (!cnic) {
            alertify.error('Unable to retrieve CNIC for the roll number.');
            return;
        }

        await addDoc(collection(db, 'marks'), {
            course,
            rollNumber, 
            cnic, 
            marks,
            totalMarks,
            grade
        });

        alertify.success('Student marks uploaded successfully!');
        
        uploadMarksForm.reset();
    } catch (error) {
        console.error('Error uploading marks: ', error);
        alertify.error('Error: ' + error.message);
    }
});
