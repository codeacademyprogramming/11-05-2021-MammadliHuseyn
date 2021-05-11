const apiUrl = "data/data.json";
const langs = {
   "En": {
      table_column_image: "Image",
      table_column_fullname: "Fullname",
      table_column_salary: "Monthly Salary",
      table_column_total: "Total monthly pay",
      table_column_credit_permit: "Can apply",
      table_column_active_loan: "Active loan",
      table_column_loaner: "Loaner",
      table_column_amount: "Amount",
      table_column_loan: "Loan",
      table_column_pay: "Monthly pay",
      table_column_due: "Due amount",
      table_column_start: "Start date",
      table_column_end: "End date",
      header_text: "Credit score evaluation",
      table_column_button: "Details",
      badge_permit_success: "Permitted",
      badge_permit_danger: "Not permitted",
      badge_active_success: "Active",
      badge_active_danger: "Closed",
      input_search: "ex: Kylie Robertson",
      btn_logout: "Log out"
   },
   "Az": {
      table_column_image: "Şəkil",
      table_column_fullname: "Ad Soyad",
      table_column_salary: "Aylıq gəlir",
      table_column_total: "Aylıq ümumi ödəniş",
      table_column_credit_permit: "Kredit icazəsi",
      table_column_active_loan: "Aktiv borc",
      table_column_loaner: "Bank",
      table_column_amount: "Məbləğ",
      table_column_loan: "Borc",
      table_column_pay: "Aylıq ödəniş",
      table_column_due: "Qalıq Borc",
      table_column_start: "Başlanğıc tarix",
      table_column_end: "Son tarix",
      table_column_button: "Ətraflı",
      header_text: "Kredit hesabı tarixçəsi",
      badge_permit_success: "İcazəli",
      badge_permit_danger: "İcazə verilmir",
      badge_active_success: "Aktiv",
      badge_active_danger: "Bağlı",
      input_search: "məs: Vaqif Muradov",
      btn_logout: "Çıxış"
   }
};

async function getJson(url) {
   let response = await fetch(url);
   let data = await response.json()
   return data;
}

async function main() {
   const data = await getJson(apiUrl);

   setDataToTable(data, getCurrentLang());
   changeTableHeadingsLang(getCurrentLang());
   toggleThemeMode(getCurrentThemeMode());
   await createSessionStorage();
   getUserFromSession();

   document.getElementById("check-active-loan").addEventListener('change', () => filterTable(data, getCurrentLang()));
   document.getElementById("search-input").addEventListener('keyup', () => filterTable(data, getCurrentLang()));
   document.getElementById("langChange").addEventListener('change', (e) => changeLang(e.target, data));
   document.getElementById("btn-change-mode").addEventListener('click', (e) => setThemeToLocalStorage(e.target))
}

//Set data to table with lang
let setDataToTable = (data, langData) => {
   let tbody = document.getElementById("user-table-body");
   tbody.innerHTML = "";
   data.forEach((user, idx) => {
      let loanStatus = isActiveLoan(user.loans);
      let loanApplyStatus = canApplyLoan(user.loans, user.salary.value);
      const row = `<tr>
                     <td scope="row">${idx + 1}</td> 
                     <td><img src="${user.img}" class="w-25"/></td>
                     <td>${user.name} ${user.surname}</td>
                     <td>${user.salary.value} ${user.salary.currency}</td>
                     <td>${calculateUserLoan(user.loans)} ${user.loans[0].amount.currency}</td>
                     <td><span class="badge  ${(loanStatus ? "bg-danger" : "bg-success")} w-50">${(loanStatus ? `${langData.badge_active_danger}` : `${langData.badge_active_success}`)}</span></td>
                     <td><span class="badge  ${(loanApplyStatus ? "bg-success" : "bg-danger")} w-75">${(loanApplyStatus ? `${langData.badge_permit_success}` : `${langData.badge_permit_danger}`)}</span></td>
                     <td><button class="btn btn-info w-100 text-white btn-details" data-id="${idx}">${langData.table_column_button}</button></td>
                  </tr>`
      tbody.innerHTML += row;
      showDetailsEventHandler(data, langData);
   });
}

//Calculate user's active loans total amount
let calculateUserLoan = (loans) => {
   return loans.reduce((total, loan) => {
      if (!loan.closed)
         return total + loan.perMonth.value;

      return total;
   }, 0)
}

//Check if user has at least one active loan
let isActiveLoan = (loans) => {
   let isLoanActive = true;

   loans.forEach(status => {
      if (!status.closed)
         isLoanActive = false;
   });

   return isLoanActive;
}

//Check if user can apply for loan
let canApplyLoan = (loans, salary) => {
   let totalLoans = calculateUserLoan(loans);
   let isApply = (salary * 45 / 100) > totalLoans;

   return isApply;
}

//Show details button event handler
let showDetailsEventHandler = (data, langData) => {
   document.querySelectorAll(".btn-details").forEach((btn) => {
      btn.addEventListener("click", () => {
         const index = btn.getAttribute("data-id");
         setDataToModal(data[index], langData);
         $("#details-modal").modal("toggle");
         $(".close-modal").click(() => { $("#details-modal").modal("toggle") });
      })
   })
}

//Set data to modal with lang
let setDataToModal = (user, langData) => {
   const tbody = document.getElementById("details-table");
   tbody.innerHTML = "";
   let header = document.getElementById("modal-header");
   header.innerHTML = `<h5 class="modal-title">${user.name} ${user.surname}</h5>`
   user.loans.forEach(loan => {
      let perMonth = "N/A";
      let badge = `<span class='badge bg-danger w-100'>${langData.badge_active_danger}</span>`

      if (loan.perMonth != undefined)
         perMonth = `${loan.perMonth.value} ${loan.perMonth.currency}`;

      if (!loan.closed)
         badge = `<span class='badge bg-success w-100'>${langData.badge_active_success}</span>`;

      const row = `<tr>
                     <td>${loan.loaner}</td>
                     <td>${loan.amount.value} ${loan.amount.currency}</td>
                     <td>${badge}</td>
                     <td>${perMonth}</td>
                     <td>${loan.dueAmount.value} ${loan.dueAmount.currency}</td>
                     <td>${loan.loanPeriod.start}</td>
                     <td>${loan.loanPeriod.end}</td>
                  </tr>`
      tbody.innerHTML += row;
   })
}

//Filter table with search & active/closed loans & lang
let filterTable = (data, currentLang) => {
   let input = $('#search-input').val().toUpperCase();

   //filter for search input
   if (input)
      data = data.filter(user => `${user.name} ${user.surname}`.toUpperCase().includes(input));

   //filter for active loan 
   if ($("#check-active-loan").prop('checked'))
      data = data.filter(user => !isActiveLoan(user.loans)).map((user) => {
         return user;
      })

   setDataToTable(data, currentLang);
}

//If doesn't exists set localStorage else change lang selected attr
let setLocalStorage = () => {
   if (!localStorage.getItem("settings")) {

      const settings = {
         lang: "En",
         theme: "dark"
      }

      localStorage.setItem("settings", JSON.stringify(settings));
   }
   else {
      const lang = JSON.parse(localStorage.getItem("settings")).lang;
      $(`#langChange option[value='${lang}']`).attr("selected", "selected");
   }
}

//Change lang on change of select option and set to localStorage
let changeLang = (target, data) => {
   const selectedLang = target.value;

   let settings = JSON.parse((localStorage.getItem("settings")));
   settings.lang = selectedLang;
   localStorage.setItem("settings", JSON.stringify(settings));

   setDataToTable(data, getCurrentLang());
   changeTableHeadingsLang(getCurrentLang());
}

//Get lang object translated to current lang
let getCurrentLang = () => {
   let lang = JSON.parse((localStorage.getItem("settings"))).lang;
   return langs[lang];
}

//Change nodeValue of tableHeadings without effect childNodes
let changeTableHeadingsLang = (langData) => {
   $("[data-key]").each((index, th) => {
      thForLang = langData[$(th).attr("data-key")];
      th.childNodes[0].nodeValue = thForLang;
   })

   $("h1").text(langData.header_text);
   $(".navbar-brand").text(langData.header_text);
   $("#form-logout button[type=submit]").text(langData.btn_logout);
   $("input[type=search]").attr("placeholder", langData.input_search);
}

//Get current theme mode of document from localStorage
let getCurrentThemeMode = () => {
   const mode = JSON.parse(localStorage.getItem("settings")).theme;
   return mode;
}

//Toggle theme mode of document on load or click of button
let toggleThemeMode = (curTheme, prevTheme, target = $("#btn-change-mode")[0]) => {
   if (prevTheme === undefined)
      prevTheme = curTheme == "dark" ? "light" : "dark";

   let [table, modalTable] = $(`.table-${prevTheme}`);

   $(target).text(`${prevTheme} mode`);
   $(target).removeClass(`btn-${curTheme}`).addClass(`btn-${prevTheme}`);
   $(table).removeClass(`table-${prevTheme}`).addClass(`table-${curTheme}`);
   $(modalTable).removeClass(`table-${prevTheme}`).addClass(`table-${curTheme}`);
   $(".navbar").removeClass(`navbar-${prevTheme}`).addClass(`navbar-${curTheme}`);
   $("#user-name").removeClass(`text-${curTheme}`).addClass(`text-${prevTheme}`);

   let elements = $(`.bg-${prevTheme}`);
   $(elements).each((index, element) => {
      $(element).removeClass(`bg-${prevTheme}`).addClass(`bg-${curTheme}`);
   })

}

//Set theme to localStorage on click of button
let setThemeToLocalStorage = (target) => {
   let settings = JSON.parse(localStorage.getItem("settings"));
   let tmpPrevTheme = settings.theme;
   let curTheme = settings.theme;
   curTheme = curTheme == "dark" ? "light" : "dark";
   settings.theme = curTheme;
   localStorage.setItem("settings", JSON.stringify(settings));
   toggleThemeMode(getCurrentThemeMode(), tmpPrevTheme, target);
}

//Get user from SessionStorage
let getUserFromSession = () => {
   let data = JSON.parse(sessionStorage.getItem("session_user"));
   data = data[0];
   const name = `${data.name.title} ${data.name.first} ${data.name.last}`;
   $("#logined-user>#user-img").attr("src", data.picture.thumbnail);
   $("#logined-user>#user-name").text(name);
}

//Set so session user get from fetch
const setSession = (user) => {
   sessionStorage.setItem("session_user", JSON.stringify(user.results));
   console.log("setted")
}

//SessionStorage creator
const createSessionStorage = async () => {
   if (!sessionStorage.getItem("session_user")) {
      await fetch("https://randomuser.me/api/")
         .then(data => data.json())
         .then(setSession);
   }
}

createSessionStorage();
setLocalStorage();
main();