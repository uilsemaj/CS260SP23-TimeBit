import {db, deleteTask, markCompleted, POWER_USER_ID} from "./firestore.js";
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
        // console.log(`${doc.id} => ${doc.data()}`);
        // console.log(doc.data())
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
        
        var taskHTML = '<div class="list-item" data-id="' + task.id + '">' + 
        '<div class="list-content"><div class="profile">' + '<img src="' + imageUrl + '"></div>' + 
        '<div class="caption"><p class="task-header">' + taskNameDisplay +  '</p><p>' + description + 
        '</p></div><button id="ellipse" class="ellipse"><div class="list-icon"><i class="bx bx-dots-horizontal-rounded"></i></div></button></div>' +
        '<button id="complete" class="complete"><div class="list-icon"><i class="bx bx-check"></i></div></button>' + '</div>';

        $('#task-container').append(taskHTML);

        i++;
    }

    // Left swipe <reference: https://github.com/hosseinnabi-ir/Touch-Swiping-List-Items-using-JavaScript>
    const items = document.querySelectorAll('.list-item');
    
    items.forEach(item => {
        // Touch start
        item.addEventListener('touchstart', e => {
            e.target.dataset.x = Number(e.touches[0].pageX) + Number(e.target.dataset.move) || 0;
        });
        // Touch move
        item.addEventListener('touchmove', e => {
            let moveX = Number(e.target.dataset.x) - e.touches[0].pageX;
            // Set up move duration
            moveX < 130 ? moveX = 95 : null;
            e.target.dataset.move = moveX;
            anime({
                targets: e.target,
                translateX: -Number(e.target.dataset.move),
                duration: 300
            });
        });
        // Touch end
        item.addEventListener('touchend', e => {
            let elementMove = e.target.dataset.move;
            if (elementMove > 100)
                elementMove = 100;
            else
                elementMove = 0;
    
            items.forEach(item => {
                let content = item.querySelector('.list-content');
                if (content === e.target) {
                    return null;
                }
                content.dataset.x = 0;
                content.dataset.move = 0;
                anime({
                    targets: content,
                    translateX: 0
                });
            });
        });
    });

    // Mark task as completed
    const checkBtns = document.querySelectorAll('.complete');
    checkBtns.forEach((btn) => {
        btn.addEventListener("click", markTaskAsCompleted);
    });

    function markTaskAsCompleted() {
        console.log("completed");
        var taskDiv = $(this).parent();
        
        markCompleted(taskDiv.attr("data-id")); // mark as completed in firestore
        taskDiv.fadeOut(function() {
            $(".comp").append(taskDiv);
            $('.list-item').css({
                'display': 'flex',
            });
        });
        $(this).hide();
    }

    // Ellipse choice list Pop Up
    const ellipseBtns = document.querySelectorAll('.ellipse');
    const choicepopUpBtn = document.getElementById("ellipse");
    const closeChoicePopupBtn = document.getElementById("close-choice-pop-up");
	const choicePopUp = document.getElementById("choice-pop-up");

    function showChoicePopUp() {
		choicePopUp.style.display = "flex";
	}

    function closeChoicePopup() {
        choicePopUp.style.display = 'none';
    }

    ellipseBtns.forEach((btn) => {
        btn.addEventListener("click", showChoicePopUp);
    });
    closeChoicePopupBtn.addEventListener("click", closeChoicePopup);


    // Invitations Pop Up
    const inviteBtns = document.querySelectorAll('.invite');

    const popUpBtn = document.getElementById("invite");
    const closeInvPopupBtn = document.getElementById("close-inv-pop-up");
	const invPopUp = document.getElementById("inv-pop-up");

	function showInvPopUp() {
		invPopUp.style.display = "flex";
	}

    function closeInvPopup() {
        invPopUp.style.display = 'none';
    }

	popUpBtn.addEventListener("click", showInvPopUp);
    inviteBtns.forEach((btn) => {
        btn.addEventListener("click", showInvPopUp);
    });
    closeInvPopupBtn.addEventListener("click", closeInvPopup);


    // Delete Button
    $('.ellipse').on('click', function() {
        // Show choice list pop up
        $('#choice-pop-up').addClass('active');
      
        // Get the task element
        var taskElement = $(this).closest('.list-item');
      
        // Add click event listener to delete button
        $('#delete').on('click', function() {
          // delete from db
          deleteTask(taskElement.attr("data-id"));
        
          // Remove the task element from the DOM
          taskElement.remove();
          choicePopUp.style.display = 'none';
        });
    });

    // Completed Task Folding
    var coll = document.getElementsByClassName("collapsible");
    var j;

    for (j = 0; j < coll.length; j++) {
        coll[j].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
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