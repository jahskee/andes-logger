"use strict";

module.exports = (function () {
  const myutil = require("./myutil");

  function trackButtonClicks() {
    document.addEventListener(
      "click",
      function (event) {
        try {
          const target = event.target;
          const tagName = target.tagName.toLowerCase();

          if (target.tagName === "SELECT") {
            return;
          }

          if (target.tagName === "BODY" || target.tagName === "HTML") return;

          let tagId = "";
          if (
            typeof target.id !== "undefined" &&
            target.id !== null &&
            target.id !== ""
          ) {
            tagId = " #" + target.id;
          }

          let textContent = "";
          if (target.getAttribute("va-click-track") !== null) {
            textContent = target.getAttribute("va-click-track");
            tagId = ""; // only show id to identfy the element
          } else if (target.getAttribute("value") !== null) {
            textContent = target.value.trim();
          } else if (
            typeof target.textContent !== "undefined" &&
            target.textContent !== null
          ) {
            textContent = target.textContent.trim();
          } else if (typeof target.checked !== "undefined" && target.checked) {
            textContent = target.parentNode.textContent;
          }

          if (textContent !== "") {
            textContent = myutil.toTitleCase(textContent);
          }

          if (target.tagName === "BUTTON") {
            console.log("click button" + tagId + "->[" + textContent + "]");
          } else if (target.tagName === "INPUT") {
            const type = target.type;

            let value = null;
            if (typeof target.value !== "undefined") {
              value = myutil.toTitleCase(target.value);
            }

            let checked = null;
            if (typeof target.checked !== "undefined") {
              checked = target.checked ? "check" : "uncheck";
            } else {
              checked = "";
            }

            if (type === "submit") {
              if (target.getAttribute("value") === null) {
                console.log("click submit" + tagId + "->[Submit]");
              } else {
                console.log("click submit" + tagId + "->[" + value + "]");
              }
            } else if (type === "radio") {
              console.log(
                "click " +
                  type +
                  tagId +
                  "->[" +
                  myutil.toTitleCase(myutil.getRadioLabelText(target)) +
                  "]"
              );
            } else if (type === "checkbox") {
              console.log(
                "click " +
                  type +
                  tagId +
                  "->[" +
                  textContent +
                  " - " +
                  checked +
                  "]"
              );
            }
          } else if (target.tagName === "A") {
            console.log("click href" + tagId + "->[" + textContent + "]");
          } else {
            if (target.getAttribute("va-click-track") && textContent !== "") {
              console.log(
                "click " + tagName + tagId + "->[" + textContent + "]"
              );
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
      false
    ); // make sure capturing is true
  }

  return { trackButtonClicks };
})();
