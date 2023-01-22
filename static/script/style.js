let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");
let putanjaOnama = document.querySelector(".oNamaSekcija");
putanjaOnama.addEventListener("click", () => {
  location.href = "/static/about.html";
});
openHamburger.addEventListener("click", () => {
  if (hamburgerData.style.display === "block") {
    hamburgerData.style.display = "none";
  } else {
    hamburgerData.style.display = "block";
    hamburgerData.style.margin = "0px 0px 120px 0px";
  }
});
