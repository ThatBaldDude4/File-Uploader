const dialog = document.querySelector(".file_dialog");
const uploadBtns = document.querySelectorAll(".upload-btn");
const select = document.querySelector(".folder_select");
const closeModalBtn = document.getElementById("close-modal");

uploadBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        select.value = e.currentTarget.dataset.folderId;
        console.log(select.value);
        dialog.showModal();
    })
})

closeModalBtn.addEventListener("click", () => {
    dialog.close()
})
