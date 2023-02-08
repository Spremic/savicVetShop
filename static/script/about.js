//prvi slajder
const slider = document.querySelector(".aboutImgDesing");
const images = slider.querySelectorAll(".slider");
let index = 0;
images[index].style.display = "block";
function changeSlide() {
  for (let i = 0; i < images.length; i++) {
    images[i].style.display = "none";
  }
  images[index].style.display = "block";
  index = (index + 1) % images.length;
}
setInterval(changeSlide, 3000);

//drugi slajder
const slider2 = document.querySelector(".slide2");
const images2 = document.querySelectorAll(".slider2");
let index2 = 0;
images2[index2].style.display = "block";
function changeSlide2() {
  for (let i = 0; i < images2.length; i++) {
    images2[i].style.display = "none";
  }
  images2[index2].style.display = "block";
  index2 = (index2 + 1) % images2.length;
}
setInterval(changeSlide2, 3000);

//hamburger
let openHamburger = document.querySelector("#hamburger");
let hamburgerData = document.querySelector(".desingNavigation");

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

//readmor
let readMore = document.querySelector(".readMore");
let showReadMore = document.querySelector(".txtMore");

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
