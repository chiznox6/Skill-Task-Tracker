document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:3000";

  // === Dark Mode Toggle ===
  const toggleBtn = document.getElementById("toggle-dark");

  const savedMode = localStorage.getItem("theme");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });

  // === Fetch & Render Profile ===
  fetch(`${baseUrl}/profile`)
    .then(res => res.json())
    .then(renderProfile);

  function renderProfile(profile) {
    document.getElementById("profile-image").src = profile.image;
    document.getElementById("profile-name").textContent = profile.name;
    document.getElementById("profile-bio").textContent = profile.bio;
    document.getElementById("profile-skills").textContent = profile.skills.join(", ");

    document.getElementById("edit-name").value = profile.name;
    document.getElementById("edit-bio").value = profile.bio;
    document.getElementById("edit-skills").value = profile.skills.join(", ");
    document.getElementById("edit-image").value = profile.image;
  }

  // === Edit Profile Submission with Upload Limit & Preview ===
  const profileForm = document.getElementById("profile-form");
  const imageInput = document.getElementById("edit-image-file");
  const imageUrlInput = document.getElementById("edit-image");
  const previewImage = document.getElementById("profile-image");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file && file.size > 2000000) {
      alert("Image is too large. Please select one under 2MB.");
      imageInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("profile-message");

    let finalImage = imageUrlInput.value;
    const file = imageInput.files[0];

    if (file) {
      if (file.size > 2000000) {
        alert("Image is too large. Please select one under 2MB.");
        return;
      }
      finalImage = await toBase64(file);
    }

    const updatedProfile = {
      name: document.getElementById("edit-name").value,
      bio: document.getElementById("edit-bio").value,
      skills: document.getElementById("edit-skills").value.split(",").map(skill => skill.trim()),
      image: finalImage
    };

    fetch(`${baseUrl}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProfile)
    })
      .then(res => res.json())
      .then(data => {
        renderProfile(data);
        messageDiv.textContent = "✅ Profile updated successfully!";
        setTimeout(() => messageDiv.textContent = "", 3000);
        profileForm.reset();
      });
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  // === Fetch & Render Projects ===
  fetch(`${baseUrl}/projects`)
    .then(res => res.json())
    .then(projects => projects.forEach(renderProject));

  function renderProject(project) {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${project.title}</strong> - ${project.description}<br>
      <em>${project.tech}</em> | <a href="${project.link}" target="_blank">View</a>
    `;
    document.getElementById("project-list").appendChild(li);
  }

  document.getElementById("project-form").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const newProject = {
      title: form.title.value,
      description: form.description.value,
      tech: form.tech.value,
      link: form.link.value
    };

    fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newProject)
    })
      .then(res => res.json())
      .then(renderProject);

    form.reset();
  });

  // === Fetch & Render Tasks ===
  fetch(`${baseUrl}/tasks`)
    .then(res => res.json())
    .then(tasks => tasks.forEach(renderTask));

  function renderTask(task) {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} />
      <span>${task.task}</span>
    `;

    li.querySelector("input").addEventListener("change", () => {
      fetch(`${baseUrl}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ completed: !task.completed })
      });
    });

    document.getElementById("task-list").appendChild(li);
  }

  document.getElementById("task-form").addEventListener("submit", e => {
    e.preventDefault();
    const input = e.target.querySelector("input");
    const newTask = { task: input.value, completed: false };

    fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newTask)
    })
      .then(res => res.json())
      .then(renderTask);

    input.value = "";
  });

  // === Fetch & Render Notes ===
  fetch(`${baseUrl}/notes`)
    .then(res => res.json())
    .then(notes => notes.forEach(renderNote));

  function renderNote(note) {
    const li = document.createElement("li");
    li.textContent = note.content;
    document.getElementById("note-list").appendChild(li);
  }

  document.getElementById("note-form").addEventListener("submit", e => {
    e.preventDefault();
    const textarea = e.target.querySelector("textarea");
    const newNote = { content: textarea.value };

    fetch(`${baseUrl}/notes`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newNote)
    })
      .then(res => res.json())
      .then(renderNote);

    textarea.value = "";
  });
});
