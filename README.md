# Decentralized Automation System for Home (DASH)

A fun little acronym project I'm starting to help me take back control of my life and to express myself through code. This is a personal project that will contians parts of my day/life that I want see how I am operating, how I can take advantage, make adjustments. This project is an extremely ambitious project that is deisgned to help me learn, implement best practices and keep me up to date. Shoutout Satoshi Nakamoto, Shoutout to my demons for pushing me to do this.

Should you stumble upon this repository, please excuse any spelling, grammatical errors and just have a little fun. **Strap in**

## Product View
There will be 3 main pillars Budget, To-do (calendar), Home

### Budget
Straightforward, the goal for this module to calculate everything related to a budget that I will create with my wife. We come up with the budget ourselves, set the parameters, buckets, and funding allocation for each bucket. The goal is then to track every single expense we make, and ensure that they are within the budget parameters we defined. It will let us know on the budget home page if we get close to our allocation; it will also be able to generate reports for us on a monthly basis. There is a `household` field, this field is currently designed to help me track expenses between where I currently live and supporting my mom. These reports will then be able be exportable into some datasheet and buckets will be adjsutable accordingly. 

### TO-DO (Calender)
As of 2/3/25, this part of the pillar is less defined. I am currently tracking all of my daily tasks on a peice of paper in the morning and writing my data down on a calendar to set up some level of reminders. I can continue to use an application such as Notion, Google calendar and other productivity tools. However, I feel as though these tools are designed specifically for coorporate usage. They are not meant for life tasks, and the categories that come against it. Besides, I'm a cocky software engineer, I can make a tool that works for *ME*. I can also categorize the tasks I do, run a report at the end of the year, see where I have spent the most time doing stuff. 

### Home
Another place of ambiguity, but I have some ideas. Currently we wake up and look at messages sent to us from Big Tech giants. These messages are not currated for the lives of humans, they are deisgned to help the capital system grow and keep on turning. I want to look at messages from myself to myself with specifically selected news outlets, with more positivity, the beauty of life and reminders of how we can help each other and the world. I want this home page to be the first thing I look at. Help me realize that with a little bit of effort and not being as distracted. I can create something that I look at every single morning to remind myself what I have the opportunity to do, the budget to spend and a positive message from some of my favorite people in history such as Marcus Aurelius.

### Future and beyond
Several opportunties lie ahead once I get these 3 things up and going. I think my personal productivity will skyrocket. There's probably going to be several data mining opportunties I'll have. some ideas I'll jot down for later.

1) Pinocchio AI -> My customized AI bot. with enough of my journaled data and thoughts, Pinocchio will help me smell the truth from sources
2) Medical and Diet Log -> Customized logging dashboard of my blood test/work YoY and the foods I eat to predict how my next blood work will go
3) Exercise log -> Workout plans and dashboard to help me get really cut, I'm halfway there :wink:. Lets get that full mile in.
4) Gardener -> I plan on having a garden one day. The sprinkler system will be connected to DASH, dont have enough info on what this looks like yet.


# Technial SPECs
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
Desined to be a monolithic App with the front-end running on port 3000 and the backend running on 5000
Database is a Postgres DB (currently a production DB is being hosted on heroku)

## Future Proof
1) Create github tasks to self manage tasks and accomplish them
2) Dockerize the whole application and database so that it is cloud K8s ready
3) Take it to the cloud and build an immaculately beautiful CICD Pipline
4) Work through any networking capabilities when taking it on the cloud. 

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser. Use this to run just the front-end stand-alone

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm start-backend`

Runs the backend express server on [http://localhost:5000](http://localhost:5000). Use this to run just the backend stand-alone.

### `npm start-all`

Uses concurrently and runs the web-application and the backend express server on [http://localhost:5000](http://localhost:5000). Use this to run the whole development project

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## `npm run test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## `npm run test:int`

This launches Cypress testing suite. These are integration tests to run regression tests once each new functionality is run.\
Please run all the test here first before commiting to the main branch to ensure that no functionality has been broken.\
Write tests of your own for each of the functionalities before commiting in as well.

Eventually this will be integrated in a CI/CD pipeline so that there is no need for manually having to test this out. 

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
