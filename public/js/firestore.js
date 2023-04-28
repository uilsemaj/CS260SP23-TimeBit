var POWER_USER_ID = "e06Xrxa3lzNT8AA0nFvb";

const firebaseConfig = {
    apiKey: "AIzaSyCwAjDaM8KbvpsBV1j_Rj5pDr4XcXun-mU",
    authDomain: "timebits-cbd2c.firebaseapp.com",
    projectId: "timebits-cbd2c",
    storageBucket: "timebits-cbd2c.appspot.com",
    messagingSenderId: "229456209691",
    appId: "1:229456209691:web:d8e9eb6a121569be4f55be",
    measurementId: "G-BS2BH93LK6"
  };


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, updateDoc, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

const app = initializeApp(firebaseConfig);
const db = getFirestore(); // Get a reference to the Firestore database

async function deleteTask(taskId) {

    const taskRef = doc(db, "tasks", POWER_USER_ID, "tasks", taskId);

    await updateDoc(taskRef, {
        deleted: true
    });

    console.log(`deleted 1 record with id ${taskId}`);

}

async function markCompleted(taskId) {

    const taskRef = doc(db, "tasks", POWER_USER_ID, "tasks", taskId);

    await updateDoc(taskRef, {
        complete: true
    });

    console.log(`completed 1 record with id ${taskId}`);

}


export {db, deleteTask, markCompleted, POWER_USER_ID};