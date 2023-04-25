import {db, POWER_USER_ID} from "./firestore.js";
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

        var taskHTML = '<div class="list-item">' + 
        '<div class="list-content"><div class="profile"><img src="' + imageUrl + '"></div><div class="caption"><h3>' + taskName + ' - ' + estimatedTime +  ' min</h3><p>' + description + '</p></div></div>' +
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
            moveX < -130 ? moveX = 95 : null;
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
            else if (elementMove < -100)
                elementMove = -100;
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
        taskDiv.fadeOut(function() {
            $(".comp").append(taskDiv);
            taskDiv.fadeIn();
            taskDiv.find(".fa-trash-alt").remove();
        });
        $(this).remove();
    }

    // Invitations Pop Up
    const inviteBtns = document.querySelectorAll('.invite');

    const popUpBtn = document.getElementById("invite");
    const closePopupBtn = document.getElementById("close-pop-up");
	const popUp = document.getElementById("pop-up");

	function showPopUp() {
		popUp.style.display = "flex";
	}

    function closePopup() {
        popUp.style.display = 'none';
    }

	popUpBtn.addEventListener("click", showPopUp);
    inviteBtns.forEach((btn) => {
        btn.addEventListener("click", showPopUp);
    });
    closePopupBtn.addEventListener("click", closePopup);
    
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