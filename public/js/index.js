import {db, deleteTask, POWER_USER_ID} from "./firestore.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

const categoryToImage = {
    "other": "https://cdn-icons-png.flaticon.com/512/858/858150.png",
    "workout": "https://cdn-icons-png.flaticon.com/512/38/38464.png",
    "language": "https://cdn-icons-png.flaticon.com/512/484/484633.png",
    "running": "https://cdn-icons-png.flaticon.com/512/5073/5073994.png",

}
document.addEventListener("DOMContentLoaded", async function(event) {

    $(document).on("click", ".tablinks", function() {
        var tabName = $(this).attr("data-tab");
        $(".tabcontent").hide();
        $(".tablinks").removeClass("active");
        $("#" + tabName).show();
        $(this).addClass("active");
    });

    $('#home-tab-button').click();



    const allTasksRef = collection(db, "tasks");

    const userTasksRef = doc(allTasksRef, POWER_USER_ID);

    const userTasks = collection(userTasksRef, "tasks");

    const querySnapshot = await getDocs(userTasks);

    var tasks = [];

    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
        console.log(doc.data())
        var data = doc.data();
        var task = new Task(doc.id, data['task_name'], data['description'], data['completed'], data['estimated_time'], data['image_url'], data['invited'], data['category'], data['deleted']);

        // filter out ones with deleted set to true
        if (!task.deleted) {
            tasks.push(task);
        }
    });

    let i = 0;
    while (i < tasks.length) {
        var task = tasks[i];
        var taskName = task.task_name;
        var estimatedTime = task.estimated_time;
        var description = task.description;

        // Grab Existing Image based on category is url not provided.
        var imageUrlByCategory = task.category == null ? categoryToImage["other"] : categoryToImage[task.category]; //TODO: edge case handling
        var imageUrl = task.image_url == null ? imageUrlByCategory : task.image_url;

        var taskNameDisplay = estimatedTime == null ? taskName : taskName + ' - ' + estimatedTime  +  'min';
        var taskHTML = '<div class="task" data-id="' + task.id + '"><img src="' + imageUrl + '"><p class="task-header">' + taskNameDisplay +  '</p><p>' + description
        + '</p><i class="fas fa-trash-alt">' + '</i><i class="fas fa-check"></i></div>';

        $('.task-container .notcomp').append(taskHTML);

        i++;
    }

    // Add event handler to the dynamically created task divs
    $(".task-container .notcomp").on("click", ".task", function() {
        $(this).toggleClass("completed");
    });

    // Add event handler to the dynamically created trash icons
    $(".task-container .notcomp").on("click", ".fa-trash-alt", function() {
        var taskDiv = $(this).parent();

        //TODO: add actual delete
        deleteTask(taskDiv.attr("data-id"));
        taskDiv.fadeOut(function() {
            taskDiv.remove();
        });
    });

    // Add event handler to the dynamically created check icons
    $(".task-container .notcomp").on("click", ".fa-check", function() {
        var taskDiv = $(this).parent();
        taskDiv.fadeOut(function() {
            $(".comp").append(taskDiv);
            taskDiv.fadeIn();
            taskDiv.find(".fa-trash-alt").remove();
        });
        $(this).remove();
    });
    
});


class Task {
    constructor(id, task_name, description, completed, estimated_time, image_url, invited, category, deleted) {
        this.id = id;
        this.task_name = task_name;
        this.description = description;
        this.completed = completed;
        this.estimated_time = estimated_time;
        this.image_url = image_url;
        this.invited = invited;
        this.category = category;
        this.deleted = deleted == null ? false : deleted;
    }
}