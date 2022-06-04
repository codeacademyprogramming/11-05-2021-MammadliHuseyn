//Logout function on logout submit and remove cookie
$("#form-logout").submit((e) => {
    e.preventDefault();
    sessionStorage.removeItem("session_user");
    removeCookie();
    location.reload();
})

//Cookie remover
const removeCookie = () => {
    let date = new Date();
    date.setTime(date.getTime() - (1 * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toGMTString()}`;
    document.cookie = `cookie_user=supersecuretoken${expires}; path=/`;
}