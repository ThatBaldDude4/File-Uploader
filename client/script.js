const uploadBtns = document.querySelectorAll(".upload-btn");
const select = document.querySelector(".folder_select");
const closeModalBtn = document.getElementById("close-modal");
const folderNames = document.querySelectorAll("folder_name");
const deleteBtns = document.querySelectorAll(".delete-folder-btn");
const deleteFileBtns = document.querySelectorAll(".delete-file-btn");
const fileDialog = document.querySelector(".file-dialog");
const uploadDialog = document.querySelector(".upload-dialog");


document.addEventListener("click", (e) => {
    const uploadBtn = e.target.closest(".upload-btn");
    if (!uploadBtn) {return};
    select.value = uploadBtn.dataset.folderId;
    uploadDialog.showModal();
})

document.querySelector(".folders").addEventListener("dblclick", (e) => {
    const heading = e.target.closest(".folder-name");
    const folder = e.target.closest(".folder-container");

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


document.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-folder-btn");
    if (!deleteBtn) {return};

    const folder = deleteBtn.closest(".folder-container");
    const id = folder.dataset.folderId;

    const response = await fetch(`/deleteFolder/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        folder.remove();
    }
})

document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".close-dialog");
    if (!closeBtn) {return};

    const dialog = e.target.closest("dialog");
    if (!dialog){ return };
    dialog.close();
})


document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-file-btn");
    if (!btn) {return}

    const file = btn.closest(".file-container");
    const id = file.dataset.fileId;
    console.log(id);
    const response = await fetch(`/deleteFile/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        file.remove();
    }
})


document.addEventListener("click", async (e) => {
    const fileContainer = e.target.closest(".file-container");
    if (!fileContainer) {return};
    if (e.target.closest("button")) return;
    if (e.target.closest(".download-btn")) return;

    const id = fileContainer.dataset.fileId;
    if (!id) {return}

    const response = await fetch(`/home/file/${id}`);
    if (!response.ok) {return};

    const file = await response.json();
    const fileHTML = createFileElement(file);

    fileDialog.innerHTML = "";
    fileDialog.append(fileHTML);
    fileDialog.showModal();
})

function createFileElement(file) {
    const container = document.createElement("div");
    container.className = "file-container";
    container.dataset.fileId = file.id ?? "";

    const name = document.createElement("h4");
    name.textContent = `File name: ${file.original_name}`;

    const created = document.createElement("p");
    created.textContent = `Created at: ${file.created_at}`;

    const size = document.createElement("p");
    size.textContent = `Size: ${file.sizeByte / 1000}Kb`;

    const download = document.createElement("a");
    download.href = `/home/files/download/${file.id}`;
    download.textContent = "Download";
    download.className = "download-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-file-btn";
    deleteBtn.textContent = "Delete File";

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-dialog";
    closeBtn.textContent = "X";

    container.append(name, created, size, download, deleteBtn, closeBtn);

    return container;
}