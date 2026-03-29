  const hamburger = document.querySelector(".hamburger-menu");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });

  mobileMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });