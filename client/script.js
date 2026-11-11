const dialog = document.querySelector(".file_dialog");
const uploadBtns = document.querySelectorAll(".upload-btn");
const select = document.querySelector(".folder_select");
const closeModalBtn = document.getElementById("close-modal");
const folderNames = document.querySelectorAll("folder_name");
const deleteBtns = document.querySelectorAll(".delete-folder-btn");
const deleteFileBtns = document.querySelectorAll(".delete-file-btn");

uploadBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        select.value = e.currentTarget.dataset.folderId;
        console.log(select.value);
        dialog.showModal();
    })
})

document.querySelector(".folders").addEventListener("dblclick", (e) => {
    const heading = e.target.closest(".folder-name");
    const folder = e.target.closest(".folder-container");
    console.log(folder)
    if (!folder) return;
    if (!heading) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/editFolder/${folder.dataset.folderId}`;

    form.innerHTML = `
        <input name="folder_name" required maxlength="255">
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
    `;

    const input = form.querySelector("input");
    input.value = heading.textContent.trim();

    form.querySelector('[type="button"]').onclick = () => {
        form.replaceWith(heading);
    };

    input.onkeydown = (e) => {
        if (e.key === "Escape") form.replaceWith(heading);
    };

    heading.replaceWith(form);
    input.focus();
    input.select();
});

closeModalBtn.addEventListener("click", () => {
    dialog.close()
})

deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        const folder = e.currentTarget.closest(".folder-container");
        const id = folder.dataset.folderId;

        const response = await fetch(`/deleteFolder/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            folder.remove();
        }
    });
});

deleteFileBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        const file = e.currentTarget.closest(".file-container");
        const id = file.dataset.fileId;
        const response = await fetch(`/deleteFile/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            file.remove();
        }
    });
});