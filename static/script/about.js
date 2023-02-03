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
let putanjaOnama = document.querySelector(".oNamaSekcija");
openHamburger.addEventListener("click", () => {
  if (hamburgerData.style.display === "block") {
    hamburgerData.style.display = "none";
  } else {
    hamburgerData.style.display = "block";
    hamburgerData.style.margin = "0px 0px 120px 0px";
  }
});

// if (putanjaOnama) {
//   putanjaOnama.addEventListener("click", () => {
//     location.href = "/static/about.html";
//   });
// }
