let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");
const oNamaPutanja = document.querySelector(".oNamaSekcija");
const uslugePutanja = document.querySelector(".uslugeSekcija");
let readMore = document.querySelector(".readMore");
let showReadMore = document.querySelector(".txtMore");
//readmore
readMore.addEventListener("click", () => {
  if (readMore.innerHTML === "Procitaj vise") {
    showReadMore.style.display = "block";
    readMore.innerHTML = "Smanji";
    readMore.style.color = "rgb(238, 71, 71)";
  } else {
    showReadMore.style.display = "none";
    readMore.innerHTML = "Procitaj vise";
    readMore.style.color = "rgba(36, 36, 209, 0.726)";
  }
});
//hamburger
openHamburger.addEventListener("click", () => {
  if (hamburgerData.style.display === "block") {
    hamburgerData.style.display = "none";
    openHamburger.innerHTML = "☰";
  } else {
    hamburgerData.style.display = "block";
    hamburgerData.style.margin = "0px 0px 120px 0px";
    openHamburger.innerHTML = "X";
  }
});

//link
oNamaPutanja.addEventListener("click", () => {
  location.href = "/about.html";
});

uslugePutanja.addEventListener("click", () => {
  location.href = "/usluge.html";
});
