//If cookie already exists go to 
(function checkIfLoginAlready() {
    if (document.cookie.includes("cookie_user=supersecuretoken")) {
        document.location.href = "./index.html";
    }
    else {
        $("body").removeClass("d-none");
    }
})();


//Admin username password object for login
const admin = {
    username: "admin",
    email: "admin@gmail.com",
    password: "123"
};

//Cookie creator
const createCookie = (name, value, days) => {
    let expires;
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toGMTString()}`;
    }
    else expires = "";
    document.cookie = `${name}=${value}${expires}; path=/`;
}

//On submit action for login with cookie
$('#form-login').submit((e) => {
    e.preventDefault();
    if ($("#username").val().trim() == admin.username && $("#password").val() == admin.password) {

        //add token to cookie
        createCookie("cookie_user", "supersecuretoken", 1);

        document.location.href = "./index.html";
    }
    else {
        $("#validation").removeClass("d-none");
    }
});