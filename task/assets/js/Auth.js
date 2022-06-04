//If cookie not exists go to Login page
(function checkIfLoginAlready() {
    if (!document.cookie.includes("cookie_user=supersecuretoken")) {
        document.location.href = "./login.html";
    }
    else {
        $("body").removeClass("d-none");
    }
})();
