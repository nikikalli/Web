import * as services from "../../services/service.js";
import { bcrypt } from "../../deps.js";
import { validate, required, isEmail, numberBetween, minLength, isInt, isNumber } from "../../deps.js";
import { updateSt, showBehavior, getEmail } from "../controllers/generalControllers.js";
import { showLoginForm, showRegistrationForm } from "../controllers/authenticationController.js";




const validationRules = {
    email: [required, isEmail],
    password: [required, minLength(4)]
};
const validationRulesMorning = {
    sleep: [required, isNumber, numberBetween(0, 24)],
    sleepq: [required, isInt, numberBetween(1, 5)],
    moodq: [required, isInt, numberBetween(1, 5)]
}

const validationRulesEvening = {
    eat: [required, isInt, numberBetween(1, 5)],
    gmood: [required, isInt, numberBetween(1, 5)],
    study: [required, isNumber, numberBetween(0, 24)],
    sport: [required, isNumber, numberBetween(0, 24)]
}

const postRegistrationForm = async({request, response, render}) => {
    const body = request.body();
    const params = await body.value;
      
    const email = params.get('email');
    const password = params.get('password');
    const verification = params.get('verification');

    let [passes, errors] = await validate({email, password}, validationRules);



    if (!passes) {
        console.log("Here's one error");
        showRegistrationForm({render : render}, errors, email);
        return;
    }


    if (password !== verification) {
        const error = [["Passwords don't match"]]
        showRegistrationForm({render:render}, error, email);
        return;
    }
    const existingUsers = await services.getUser(email);
    if (existingUsers.rowCount > 0) {
        console.log("Here's another error");
        const error = [["This email address is already used"]];
        showRegistrationForm({render : render}, error, email);
        return;
    }
    
    const hash = await bcrypt.hash(password);
    await services.addUser(email, hash)


    // For testing since OAK cannot redirect properly

    if(Deno.env.get('TEST_ENVIRONMENT')) { 
        response.status = 200;
        return;
    }
    response.redirect('/auth/login');
};



const getLogout = async({response, session, render}) => {

    await session.set('authenticated', null);
    await session.set('user', null);
    getEmail(null);

    response.redirect('/auth/login');
}
const postLoginForm = async({request, response, session, render}) => {
    const body = request.body();
    const params = await body.value;
  
    const email = params.get('email');
    const password = params.get('password');
  
    let [passes, errors] = await validate({email, password}, validationRules);


    if (!passes) {
         let error = [["Invalid email or password"]];
         showLoginForm({render : render}, error);
         return;
     }


    // check if the email exists in the database
    const res = await services.getUser(email)
    if (res.rowCount === 0) {
        let error = [["Invalid email or password"]];
        showLoginForm({render : render}, error);
        return;
    }
  
    // take the first row from the results
    const userObj = await res.rowsOfObjects()[0];
  
    const hash = userObj.password;
  
    const passwordCorrect = await bcrypt.compare(password, hash);
    if (!passwordCorrect) {
        let error = [["Invalid email or password"]];
        showLoginForm({render:render}, error);
        return;
    }
  
    await session.set('authenticated', true);
    await session.set('user', {
        id: userObj.id,
        email: userObj.email
    });

    
    const st = await getState(userObj.id);
    updateSt(st);
    getEmail(userObj.email);
    

    // For testings, OAK can't redirect
    if(Deno.env.get('TEST_ENVIRONMENT')) { 
        response.status = 200;
        return;
    }
    response.redirect('/behavior/reporting')
  };

// State used for indicating whether the data has already been submitted.
const getState = async(id) => {
    const today = new Date().toISOString().substr(0, 10)
    const res1 = await services.checkMorning(today, id);
    const res2 = await services.checkEvening(today, id);
    let state = 0;
    if(res1.rowCount !== 0 && res2.rowCount === 0) {
        state = 1
    } else if(res2.rowCount !== 0 && res1.rowCount === 0) {
        state = 2
    } else if(res2.rowCount !== 0 && res1.rowCount !== 0) {
        state = 3
    }
    return state;
}

const postReportingData = async({request, render, session, response}) => {
    
    const body = request.body();
    const params = await body.value;
  
    const sleep = params.get('sleep');
    const date = params.get('date');
    const sleepq = params.get('sleepq');
    const moodq = params.get('moodq');
    const sport = params.get('sport');
    const study = params.get('study');
    const eat = params.get('eat');
    const gmood = params.get('generic-mood');


    const id = (await session.get('user')).id
    const state = await getState(id);
    let e = [['']]; // Error

    if(sleep && date && sleepq && moodq) {
       await postMorgningData({render: render}, Number(sleep), date, Number(sleepq), Number(moodq), id, state);
       
    } else if(date && sport && study && eat && gmood) {
       await postEveningData({render: render}, Number(eat), Number(gmood), Number(study), Number(sport), date, id, state);
    } else {
       e = [['All fields must be filled.']];
       showBehavior({render:render}, e, state);
    }
}

const postMorgningData = async({render}, sleep, date, sleepq, moodq, id, state)  => {

    let [passes, errors] = await validate({date, sleep, sleepq, moodq}, validationRulesMorning);
    if (!passes) {
        showBehavior({render:render}, errors, state, sleep);
        return;
    }
    const res = await services.checkMorning(date, id);
    if(res.rowCount === 0) {
        await services.addMorning(sleep, moodq, sleepq, date, id);
    } else {
        await services.updateMorning(sleep, moodq, sleepq, date, id);
    }
    const st = await getState(id);
    updateSt(st);
    showBehavior({render:render}, errors, state);
}


const postEveningData = async({render}, eat, gmood, study, sport, date, id, state)  => {

    let [passes, errors] = await validate({eat, gmood, study, sport}, validationRulesEvening);
    if (!passes) {
        showBehavior({render:render}, errors, state, null, sport, study);
        return;
    }

    const res = await services.checkEvening(date, id);
    if(res.rowCount === 0) {
        await services.addEvening(eat, gmood, study, sport, date, id);
    } else {
        await services.updateEvening(eat, gmood, study, sport, date, id);
    } 
    const st = await getState(id);
    updateSt(st);          
    showBehavior({render:render}, errors, state);                                        
}
export{postRegistrationForm, postLoginForm, getLogout, postReportingData, postEveningData, postMorgningData}