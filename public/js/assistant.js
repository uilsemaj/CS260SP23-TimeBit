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
var initialUserMessage = `We are going to ask you to come up with a plan to help us achieve some goals in the next question. When you come up with the plan, could you give us in the format of Title, Description, DueDate for each of the task in the plan? The Due Date should start tomorrow as Day 1 of the plan in ISO Date, for example 2023-04-19. The description should be less than 10 words. Today is ${currentDate}`;
const messageHistory = [
    {"role": "user", "content": initialUserMessage},
    {"role": "assistant", "content": "Sure, I can do that. Please let me know the goals you want to achieve."}];
var hasPlan = false;

export function runFlow() {

    obtainPreliminaryPlan();
    // TODO move JSON extraction to here once time allows.
//    console.log(messageHistory[messageHistory.length-1]["content"]);

}

function parseJSONFromResponse(str) {

    const regex2 = /[\t\n\r\f\v]/g;
    // Replace all special characters with an empty string.
    const input = str.replace(regex2, '');
//   console.log(input+"\n");

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
    // Add a document to the collection
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
    console.log(`uploaded ${data.length} tasks`);
}

function toFirestoreTasks(chatGPTTasks) {

    const firestoreTasks = [];
    function toFirestoreTask(chatGPTTask) {
        firestoreTasks.push({"task_name" : chatGPTTask["Title"],
            "description" : chatGPTTask["Description"],
            "date": chatGPTTask["DueDate"]});

    }
    chatGPTTasks.forEach(toFirestoreTask);
    return firestoreTasks;
}

async function obtainPreliminaryPlan() {
    var userInput = document.getElementById("userInput").value;
    if (userInput === "") {
        return;
    }
    var chatbox = document.getElementById("chatbox");
    var userBubble = document.createElement("div");
    userBubble.innerHTML = userInput;
    userBubble.classList.add("bubble", "green");
    chatbox.appendChild(userBubble);
    messageHistory.push({role: "user", content: userInput});

    document.getElementById("userInput").value = "";
    var config = {
        headers: {
            'Authorization': 'Bearer ' + OPENAI_API_KEY,
            'Content-Type': 'application/json'
        }
    };
    var data = {
        "model": "gpt-3.5-turbo",
        "messages": messageHistory,
        "temperature": 0.7,
        "stop": "##"
    };
    axios.post('https://api.openai.com/v1/chat/completions', data, config)
        .then(function (response) {
            var botResponse = response.data.choices[0].message.content;
            messageHistory.push({role: "assistant", content: botResponse});
            console.log(response);
            console.log(messageHistory);
            var botBubble = document.createElement("div");
            botBubble.innerHTML = botResponse;
            botBubble.classList.add("bubble", "blue");
            chatbox.appendChild(botBubble);
            chatbox.scrollTop = chatbox.scrollHeight;

            //TODO move this out
            const toJSONListprompt = "Great, could you convert this plan to JSON format? I\u2019d like you to only output a single JSON list as your response. For example, if you have the following tasks in day 1:\r\n\r\nDay 1 - Get started:\r\nWarm-up: 10-minute brisk walk\r\nRun\/walk: 15 minutes at a comfortable pace\r\nCool-down: 5-minute walk\r\n\r\nCan you convert the tasks to a JSON list in this format(Assuming day 1 is 2023-04-19):\r\n\r\n[{\u201CTitle\u201D: \u201CWarm-up: 10-minute brisk walk\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D},\r\n{\u201CTitle\u201D: \u201CRun\/walk: 15 minutes at a comfortable pace\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D},\r\n{\u201CTitle\u201D: \u201CCool-down: 5-minute walk\u201D,\r\n   \u201CDueDate\u201D: \u201C2023-04-19\u201D}]";
            messageHistory.push({role: "user", content: toJSONListprompt});
            axios.post('https://api.openai.com/v1/chat/completions', data, config)
                .then(function (response) {
                    var botResponse = response.data.choices[0].message.content;
                    messageHistory.push({role: "assistant", content: botResponse});
                    console.log(response);
                    console.log(messageHistory);

                    const listOfTasks = parseJSONFromResponse(botResponse);
                    console.log(`able to retrieve the list as ${listOfTasks.toString()}`);
                    const firestoreTasks = toFirestoreTasks(listOfTasks);
                    addTasks(firestoreTasks);
                    console.log(`added list of Tasks ${firestoreTasks}`);

                    var botBubble = document.createElement("div");
                    botBubble.innerHTML = "your tasks from this plan has been added to your app! refresh and check them!";
                    botBubble.classList.add("bubble", "blue");
                    chatbox.appendChild(botBubble);
                    chatbox.scrollTop = chatbox.scrollHeight;
        })
        .catch(function (error) {
            console.log(error);
        });
    })
    .catch(function (error) {
        console.log(error);
    });
    console.log("waiting..");

}


