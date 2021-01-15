



const showLoginForm = ({render}, errors) => {
    render('login.ejs', {email: '', errors : errors});
}
const showRegistrationForm = ({render}, errors, email) => {
    render('register.ejs', {email: email, errors : errors});
}
export {showLoginForm, showRegistrationForm}