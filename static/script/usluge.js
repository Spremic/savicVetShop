let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");
let slideToVesna = document.querySelector(".fa.fa-arrow-right");
let slideToAco = document.querySelector(".fa.fa-arrow-left");
let slideToAcoMobile = document.querySelector(".fa.fa-arrow-left.pc0");
let acoDisplay = document.querySelector(".aco");

let vesnaDisplay = document.querySelector(".vesna");
let faQ = document.querySelectorAll(".fa-plus");
//hamburgerMenu
console.log(openHamburger);
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

//slajder na sekciji gde se predstavljaju o sbei
slideToVesna.addEventListener("click", () => {
  acoDisplay.style.display = "none";
  vesnaDisplay.style.display = "flex";
  // an arrow for mobile for slide to aco
  if (window.innerWidth) {
    if (window.innerWidth < 600) {
      slideToAcoMobile.style.display = "flex";
    }
  } else {
    if (document.documentElement.clientWidth < 600) {
      slideToAcoMobile.style.display = "flex";
    }
  }
});
//--------------------for mobile slider aco and vesna----------
if (window.innerWidth) {
  if (window.innerWidth < 600) {
    slideToAcoMobile.addEventListener("click", () => {
      vesnaDisplay.style.display = "none";
      acoDisplay.style.display = "flex";
    });
  }
} else {
  if (document.documentElement.clientWidth < 600) {
  }
}
//----------------------------------------------------------

slideToAco.addEventListener("click", () => {
  vesnaDisplay.style.display = "none";
  acoDisplay.style.display = "flex";
});
//mobile version slideAco and Vesna

//faq pitanja javascript za odgovore
faQ.forEach((element) => {
  element.addEventListener("click", (e) => {
    let targetli = e.target;
    let div = targetli.parentElement;
    let parentDiv = div.parentElement;
    let answer = parentDiv.querySelector(".answer");
    answer.style.display = "block";
    console.log(targetli);
    if (targetli.classList.contains("fa-plus")) {
      targetli.classList.remove("fa-plus");
      targetli.classList.add("fa-minus");
    } else {
      targetli.classList.remove("fa-minus");
      targetli.classList.add("fa-plus");
      answer.style.display = "none";
    }
  });
});
