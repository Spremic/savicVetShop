const oNamaPutanja = document.querySelector(".oNamaSekcija");
const uslugePutanja = document.querySelector(".uslugeSekcija");

//putanje
if (oNamaPutanja) {
  oNamaPutanja.addEventListener("click", () => {
    location.href = "/static/about.html";
  });
}

if (uslugePutanja) {
  uslugePutanja.addEventListener("click", () => {
    location.href = "/static/usluge.html";
  });
}
