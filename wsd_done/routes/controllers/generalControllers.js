

const showLanding = ({render}, output, mood1, mood2) => {
    render('index.ejs', {output: output, mood1:mood1, mood2:mood2})
}

let st = 0;

const updateSt = (state) => {
    st = state
};

let email = null;

const getEmail = (mail) => {
    email = mail;
}

const showBehavior = ({render}, errors, state, param1, param2, param3) => {
    let stateOfForm = state;
    console.log(stateOfForm, "eka")
    if(typeof stateOfForm === 'undefined')  {
        stateOfForm = st;
    }
    console.log(stateOfForm, "toka")
    render('reporting.ejs', {state : stateOfForm, email : email, errors : errors, today: new Date().toISOString().substr(0, 10), t : param1, tt : param2, ttt : param3});
}

const showSummary = ({render}, data, data2, yyww, yymm) => {
    const userData = {
        week:data2,
        month:data,
        weekNum: yyww,
        monthNum: yymm,
        email : email
    };

    render('summary.ejs', userData);
}

  export { showBehavior, showSummary, showLanding, updateSt, getEmail};