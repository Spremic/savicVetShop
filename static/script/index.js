let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");

openHamburger.addEventListener("click", () => {
  if (hamburgerData.style.display === "block") {
    hamburgerData.style.display = "none";
  } else {
    hamburgerData.style.display = "block";
    hamburgerData.style.margin = "0px 0px 100px 0px";
  }
});
