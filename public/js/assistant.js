import {db, POWER_USER_ID} from "./firestore.js";
import {getFirestore, collection, doc, setDoc} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

//HARD-CODED API key for now.
const OPENAI_API_KEY = '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';
// prepare chatGPT for some context
const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
let currentDate = `${day}-${month}-${year}`;
const initialUserMessage = `We are going to ask you to come up with a plan to help us achieve some goals in the next question. When you come up with the plan, could you give us in the format of Title, Description, DueDate for each of the task in the plan? The Due Date should start tomorrow as Day 1 of the plan in ISO Date, for example 2023-04-19. The description should be less than 10 words. Today is ${currentDate}`;
// Initialize starting message history
let messageHistory = [
    {"role": "user", "content": initialUserMessage},
    {"role": "assistant", "content": "Sure, I can do that. Please let me know the goals you want to achieve."}
];
var hasPlan = false;

let OPENAI_CONFIG = {
    headers: {
        'Authorization': 'Bearer ' + OPENAI_API_KEY,
        'Content-Type': 'application/json'
    }
};

// On Page Load
document.addEventListener("DOMContentLoaded", async function(event) {
    $('.assistant-second-inputs').hide();

    $('#assistant-accept').on('click', function() {

        addBubble("Yep, we'll add them now", false);
        addLoadingBubble();

        getJSONTasksFromPlan().then( (firestoreTaskObjects) => {

            addTasks(firestoreTaskObjects);
            removeLoadingBubble();
            addBubble("Great. They've been added!", false);
    
            $('.assistant-second-inputs').hide();
            $('.assistant-first-inputs').show();
        });
    });

    $('#assistant-easier').on('click', function(e) {

        $('.assistant-second-inputs').hide();

        obtainPreliminaryPlan("Can you make the last plan easier?");
    });

    $('#assistant-harder').on('click', function(e) {

        $('.assistant-second-inputs').hide();

        obtainPreliminaryPlan("Can you make the last plan harder?");
    });

});

export function runFlow() {
    $('.assistant-first-inputs').hide();
    obtainPreliminaryPlan();

    // TODO move JSON extraction to here once time allows.
//    console.log(messageHistory[messageHistory.length-1]["content"]);
}

function parseJSONFromResponse(str) {
    // Takes in a JSON string of 5 task objects and converts them to a list of JSON objects.

    const regex2 = /[\t\n\r\f\v]/g;
    // Replace all special characters with an empty string.
    const input = str.replace(regex2, '');

    // Create a regular expression to match the contents between square brackets.
    const regex = /[\[].*[\]}]/;
    // Match the contents between square brackets and return the result.
    const jsonString = regex.exec(input);

    if (jsonString != null) {

        const jsonObject = JSON.parse(jsonString);
        return jsonObject;
    }
    return null;
}

async function addTasks(listOfTasks) {
    console.log("List of tasks being uploaded...", listOfTasks);

    const data = {
        task_name: 'testing',
        date: '2023-04-20T00:00:00Z'
    };
    const allTasksRef = collection(db, "tasks");
    const userTasksRef = doc(allTasksRef, POWER_USER_ID);
    const userTasks = collection(userTasksRef, "tasks");

    async function addTask(data) {
        const newTask = doc(userTasks);
        await setDoc(newTask, data);
    }

    listOfTasks.forEach(addTask);
    // console.log(`Uploaded ${data.length} tasks`);
}

function toFirestoreTasks(chatGPTTasks) {

    const firestoreTasks = [];
    // NOTE: temporarily added `deleted` field
    function toFirestoreTask(chatGPTTask) {
        firestoreTasks.push({
            "task_name" : chatGPTTask["Title"],
            "description" : chatGPTTask["Description"],
            "date": chatGPTTask["DueDate"],
            "category": chatGPTTask["Category"]
        });
    }
    chatGPTTasks.forEach(toFirestoreTask);
    return firestoreTasks;
}

async function obtainPreliminaryPlan(prompt) {



    // User Input
    let userInput;
    if (prompt == null || prompt == "") {
        userInput = document.getElementById("userInput").value;
        if (userInput === "") {
            return;    
        }    
    } else {
        userInput = prompt;
    }

    addBubble(userInput, true);
    addLoadingBubble();

    // Adds user input to running gpt context
    messageHistory.push({role: "user", content: userInput});

    document.getElementById("userInput").value = "";

    var data = {
        "model": "gpt-3.5-turbo",
        "messages": messageHistory,
        "temperature": 0.7,
        "stop": "##"
    };

    // console.log("Before API Call message history:", messageHistory);

    axios.post('https://api.openai.com/v1/chat/completions', data, OPENAI_CONFIG)
        .then(function (response) {
            var botResponse = response.data.choices[0].message.content;

            // Adds assistant repsonse to running gpt context
            messageHistory.push({role: "assistant", content: botResponse});

            removeLoadingBubble();
            addBubble(botResponse, false);

            console.log("Got plan, awaiting user input");

            $('.assistant-second-inputs').show();
    })
    .catch(function (error) {
        console.log(error);
    });
    console.log("waiting..");
}

function toHTMLmessage(jsString) {
    return jsString.replace(/\n/g, "<br>");
}

async function getJSONTasksFromPlan() {
    // Converts the gpt response to readable JSON
    // TODO: move this out
    const toJSONListprompt = "Great, could you convert this plan to JSON format? I\u2019d like you to only output a single JSON list as your response. Each JSON item will have Four fields: \"Title\", \"DueDate\", \"Description\", and \"Category\". \"Category\" must be one of the following values: \"workout\", \"running\", \"language\", \"other\". \r\n\r\nAs an example, if you have the following tasks in day 1:\r\n\r\nDay 1 - Get started:\r\nWarm-up: 10-minute brisk walk\r\nRun\/walk: 15 minutes at a comfortable pace\r\nCool-down: 5-minute walk\r\n\r\nCan you convert the tasks to a JSON list in this format(Assuming day 1 is 2023-04-19):\r\n\r\n[{\u201CTitle\u201D: \u201CWarm-up\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D,\r\n   \"Description\": \"10-minute brisk walk\",\r\n   \u201DCategory\": \"workout\"},\r\n{\u201CTitle\u201D: \u201CRun\/walk\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D,\r\n   \"Description\": \"15 minutes at a comfortable pace\",\r\n   \u201DCategory\": \"running\"},\r\n{\u201CTitle\u201D: \u201CCool-down\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D,\r\n   \"Description\": \"5-minute walk\",\r\n   \u201DCategory\": \"workout\"}]";
    messageHistory.push({role: "user", content: toJSONListprompt});

    // console.log("After API Call 1 Message History:", messageHistory);

    var data = {
        "model": "gpt-3.5-turbo",
        "messages": messageHistory,
        "temperature": 0.7,
        "stop": "##"
    };

    return axios.post('https://api.openai.com/v1/chat/completions', data, OPENAI_CONFIG)
    .then(function (response) {
        var botResponse = response.data.choices[0].message.content;
        messageHistory.push({role: "assistant", content: botResponse});

        // Regex GPT JSON string response into a list of JS JSON objects
        const listOfTasks = parseJSONFromResponse(botResponse);
        // console.log(`able to retrieve the list as ${listOfTasks.toString()}`);

        // Converts JSON objects into Firestore compatible task objects
        const firestoreTasks = toFirestoreTasks(listOfTasks);
        console.log("Firestore Tasks Uploaded.");
        console.log(firestoreTasks);

        $('.assistant-second-inputs').show();
        // console.log("After API Call 2 Message History:", messageHistory);
        console.log("API Calls Done. Success.");

        return firestoreTasks;
    })
    .catch(function (error) {
        console.log(error);
    });
}

function addBubble(text, is_user) {
    let chatbox = document.getElementById("chatbox");

    if (is_user) {
        let userBubble = document.createElement("div");
        userBubble.innerHTML = toHTMLmessage(text);
        userBubble.classList.add("bubble", "green");
        chatbox.appendChild(userBubble);
        
    } else {
        let botBubble = document.createElement("div");

        botBubble.innerHTML = toHTMLmessage(text);
        botBubble.classList.add("bubble", "blue");
        chatbox.appendChild(botBubble);
    }
    chatbox.scrollTop = chatbox.scrollHeight;
}

function addLoadingBubble() {
    let chatbox = document.getElementById("chatbox");

    let wrapper = document.createElement("div");
    wrapper.setAttribute("style", "width: 100%; display: inline-block;");
    wrapper.classList.add("bubble-wrapper");

    let bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.setAttribute("style", "width: 30px; padding-left: 30px; background-color: lightblue;");

    let dots = document.createElement("div");
    dots.classList.add("dot-flashing");

    bubble.appendChild(dots);
    wrapper.appendChild(bubble);
    chatbox.appendChild(wrapper);
}

function removeLoadingBubble() {
    document.querySelectorAll('.bubble-wrapper').forEach(e => e.remove());
}