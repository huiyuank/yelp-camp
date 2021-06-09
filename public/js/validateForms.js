// Fetch all the forms we want to apply custom Bootstrap validation styles to
const forms = document.querySelectorAll(".validate-form");
// Get password input to do regexp testing
const password = document.querySelector("#regPassword");
// Get confirm password input to do comparison
const password2 = document.querySelector("#confirmPassword");
// If invalid password, add invalid-feedback to class
const passwordHelper = document.querySelector("#passwordHelp");
// Reg exp for password match
const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/;

// Loop over them and prevent submission
Array.from(forms).forEach(function (form) {
  form.addEventListener(
    "submit",
    function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        password.value = "";
        password2.value = "";
      }
      if (password) {
        if (!regexp.test(password.value)) {
          event.preventDefault();
          event.stopPropagation();
          password.value = "";
          passwordHelper.classList.add("invalid-feedback");
        } else {
          passwordHelper.classList.remove("invalid-feedback");
          passwordHelper.classList.add("valid-feedback");
        }
      }

      form.classList.add("was-validated");
    },
    false
  );
});

if (password2) {
  password.addEventListener("input", function (event) {
    if (this.checkValidity()) {
      password2.pattern = this.value
        .split("")
        .map((c) => (["$", "^", "*", "?"].includes(c) ? "\\" + c : c))
        .join("");
    }
  });
}
