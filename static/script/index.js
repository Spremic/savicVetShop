let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");
const oNamaPutanja = document.querySelector(".oNamaSekcija");
const uslugePutanja = document.querySelector(".uslugeSekcija");
openHamburger.addEventListener("click", () => {
  if (hamburgerData.style.display === "block") {
    hamburgerData.style.display = "none";
  } else {
    hamburgerData.style.display = "block";
    hamburgerData.style.margin = "0px 0px 120px 0px";
  }
});

oNamaPutanja.addEventListener("click", () => {
  location.href = "/about.html";
});

uslugePutanja.addEventListener("click", () => {
  location.href = "/usluge.html";
});
