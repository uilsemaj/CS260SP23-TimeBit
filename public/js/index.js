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
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
  

document.addEventListener("DOMContentLoaded", async function(event) {

    $(document).on("click", ".tablinks", function() {
        var tabName = $(this).attr("data-tab");
        $(".tabcontent").hide();
        $(".tablinks").removeClass("active");
        $("#" + tabName).show();
        $(this).addClass("active");
    });

    $('#home-tab-button').click();

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(); // Get a reference to the Firestore database

    const allTasksRef = collection(db, "tasks");

    const userTasksRef = doc(allTasksRef, POWER_USER_ID);

    const userTasks = collection(userTasksRef, "tasks");

    const querySnapshot = await getDocs(userTasks);

    var tasks = [];

    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
        console.log(doc.data())
        var data = doc.data();
        var task = new Task(doc.id, data['task_name'], data['description'], data['completed'], data['estimated_time'], data['image_url'], data['invited']);
        tasks.push(task);
    });

    let i = 0;
    while (i < tasks.length) {
        var task = tasks[i];
        var taskName = task.task_name;
        var estimatedTime = task.estimated_time;
        var description = task.description;
        var imageUrl = task.image_url;

        var taskHTML = '<div class="task"><img src="' + imageUrl + '"><p class="task-header">' + taskName + ' - ' + estimatedTime +  'min</p><p>' + description + '</p></div>'

        $('#task-container').append(taskHTML);

        i++;
    }
});

class Task {
    constructor(id, task_name, description, completed, estimated_time, image_url, invited) {
        this.id = id;
        this.task_name = task_name;
        this.description = description;
        this.completed = completed;
        this.estimated_time = estimated_time;
        this.image_url = image_url;
        this.invited = invited;
    }
}