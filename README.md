# CS260SP23-TimeBits
## Achieve your goal with dedicated personal coach

## The Problem
People today are spending more and more time working on their jobs and have limited time to achieve their personal goals outside of their careers. They are in desperate need of a tool that can help them achieve their goals with their busy schedules.

## Target User Group
Our target users are young (20s) white collar workers who have hectic work schedules and want to maximize their free-time with personal enrichment and wellness activities.

## Solutions
Timebits is an app that helps users achieve their goals with a dedicated personal coach. The apps provides an AI coach that helps users compose specific daily tasks to help them achieve their goals in different domains, from learning a new language to running a marathon. The app will ultimately integrate with the users calendars and help the user plan the best time to perform specific tasks to optimize their learnings.

### Easy Task
Users can mark actice tasks as completed.

### Medium Task
User can invite friends to join them on completing tasks.

### Hard Task
User can interact with an AI personal coach to plan detailed tasks to prepare for their goals.

## Run our app on you phone!
Add API Keys for Firebase and OpenAI (This repo won't work anymore without a new API key for the following services):

firestore.js
```
const firebaseConfig = {
    apiKey: "<TO BE FILLED>", //TODO: Value to be filled
    authDomain: "timebits-cbd2c.firebaseapp.com",
    projectId: "timebits-cbd2c",
    storageBucket: "timebits-cbd2c.appspot.com",
    messagingSenderId: "<TO BE FILLED>", //TODO: Value to be filled
    appId: "<TO BE FILLED>", //TODO: Value to be filled
    "<TO BE FILLED>", //TODO: Value to be filled
  };
```

assistant.js
```
const OPENAI_API_KEY = "<TO BE FILLED>", //TODO: Value to be filled

```

Run command line "node App.js" on your computer, then enter "your wifi ip address:8000" (eg. 10.142.212.234:8000) to your browser and access our app.

**Enjoy it and hope you have fun!**

