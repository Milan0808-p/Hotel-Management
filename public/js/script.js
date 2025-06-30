// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
});


//scripting for index.ejs page
 
let textSwitch = document.getElementById("switchCheckDefault");
    textSwitch.addEventListener("click", () => {
      let textInfo = document.getElementsByClassName("card-text-text");
      let likeBtn = document.getElementsByClassName("iii");
      for (info of textInfo) {
        if (info.style.display != "inline") {
          info.style.display = "inline";
        }
        else {
          info.style.display = "none";
        }
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
  const filtersContainer = document.querySelector(".filters");
  const filtersWrapper = document.querySelector(".filters-container");

  // Create scroll buttons
  const leftScrollBtn = document.createElement("button");
  const rightScrollBtn = document.createElement("button");

  // Add classes and content to scroll buttons
  leftScrollBtn.classList.add("scroll-btn", "left");
  rightScrollBtn.classList.add("scroll-btn", "right");
  leftScrollBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
  rightScrollBtn.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;

  // Append buttons to the filters wrapper
  filtersWrapper.appendChild(leftScrollBtn);
  filtersWrapper.appendChild(rightScrollBtn);

  // Scroll functionality
  leftScrollBtn.addEventListener("click", () => {
    filtersContainer.scrollBy({ left: -200, behavior: "smooth" });
  });

  rightScrollBtn.addEventListener("click", () => {
    filtersContainer.scrollBy({ left: 200, behavior: "smooth" });
  });

  // Show or hide scroll buttons based on scroll position
  const updateScrollButtons = () => {
    const scrollLeft = filtersContainer.scrollLeft;
    const maxScrollLeft = filtersContainer.scrollWidth - filtersContainer.clientWidth;

    leftScrollBtn.style.display = scrollLeft > 0 ? "flex" : "none";
    rightScrollBtn.style.display = scrollLeft < maxScrollLeft ? "flex" : "none";
  };

  // Attach scroll event listener
  filtersContainer.addEventListener("scroll", updateScrollButtons);

  // Initial check for scroll buttons
  updateScrollButtons();
});