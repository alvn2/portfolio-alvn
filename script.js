// IndexedDB Setup
const dbName = "PortfolioDB";
const dbVersion = 1;
let db;

// Initialize IndexedDB database
const request = indexedDB.open(dbName, dbVersion);

// Create object stores for projects and messages on database creation or upgrade
request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("projects", { keyPath: "id", autoIncrement: true });
  db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
};

// On successful database connection, load projects and messages
request.onsuccess = (event) => {
  db = event.target.result;
  loadProjects();
  loadMessages();
};

// Handle database errors
request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.errorCode);
};

// Navbar Toggle for Mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

// Typing Effect for Hero Section
const typing = document.querySelector('.typing');
const phrases = ['A passionate coder', 'Crafting digital dreams', 'Building the future'];
let phraseIndex = 0, charIndex = 0;

function type() {
  if (charIndex < phrases[phraseIndex].length) {
    typing.textContent += phrases[phraseIndex][charIndex];
    charIndex++;
    setTimeout(type, 80); // Smoother typing speed
  } else {
    setTimeout(erase, 1500);
  }
}

function erase() {
  if (charIndex > 0) {
    typing.textContent = phrases[phraseIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(erase, 40);
  } else {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typing.style.opacity = 0; // Fade out before new phrase
    setTimeout(() => {
      typing.style.opacity = 1; // Fade in new phrase
      type();
    }, 300);
  }
}
type();

// Theme Toggle (Dark/Light Mode)
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

// Skills Section (Programming Languages)
const skills = [
  { name: 'HTML', level: 90 },
  { name: 'CSS', level: 85 },
  { name: 'JavaScript', level: 80 },
  { name: 'React', level: 75 },
  { name: 'Node.js', level: 70 },
  { name: 'Python', level: 65 },
  { name: 'SQL', level: 50 },
];
const skillsList = document.getElementById('skills-list');
skills.forEach(skill => {
  const skillDiv = document.createElement('div');
  skillDiv.className = 'skill';
  skillDiv.innerHTML = `
    <span>${skill.name}</span>
    <div class="progress-bar"><div class="progress" style="width: 0%"></div></div>
  `;
  skillsList.appendChild(skillDiv);
  setTimeout(() => skillDiv.querySelector('.progress').style.width = `${skill.level}%`, 100);
});

// Projects Section with IndexedDB
const defaultProjects = [
  { title: 'Portfolio Site', desc: 'This site! A personal portfolio showcasing my skills and projects.', category: 'frontend', link: '#' },
  { title: 'API Server', desc: 'A RESTful API built to manage user data.', category: 'backend', link: '#' },
  { title: 'Task App', desc: 'A frontend app for managing daily tasks.', category: 'frontend', link: '#' },
];

function loadProjects() {
  const transaction = db.transaction(["projects"], "readonly");
  const store = transaction.objectStore("projects");
  const request = store.getAll();

  request.onsuccess = () => {
    const projects = request.result;
    if (projects.length === 0) {
      const writeTransaction = db.transaction(["projects"], "readwrite");
      const writeStore = writeTransaction.objectStore("projects");
      defaultProjects.forEach(project => writeStore.add(project));
      renderProjects(defaultProjects);
    } else {
      renderProjects(projects);
    }
  };
}

function renderProjects(projects) {
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = '';
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.desc}</p>
      <a href="${project.link}" target="_blank">View Project</a>
    `;
    projectList.appendChild(projectCard);
  });
}

// Contact Form with IndexedDB
const contactForm = document.getElementById('contact-form');
const messageLog = document.getElementById('message-log');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = {
    name: contactForm[0].value,
    email: contactForm[1].value,
    message: contactForm[2].value,
    date: new Date().toLocaleString(),
  };

  const transaction = db.transaction(["messages"], "readwrite");
  const store = transaction.objectStore("messages");
  store.add(formData);

  transaction.oncomplete = () => {
    messageLog.textContent = `Last message sent: ${formData.date}`;
    loadMessages();
    contactForm.reset();
  };
});

// Messages Log with IndexedDB
function loadMessages() {
  const transaction = db.transaction(["messages"], "readonly");
  const store = transaction.objectStore("messages");
  const request = store.getAll();

  request.onsuccess = () => {
    const messages = request.result;
    renderMessages(messages);
  };
}

function renderMessages(messages) {
  const messagesList = document.getElementById('messages-list');
  messagesList.innerHTML = '';
  if (messages.length === 0) {
    messagesList.innerHTML = '<p>No messages yet.</p>';
    return;
  }
  messages.forEach(msg => {
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card';
    messageCard.innerHTML = `
      <h4>${msg.name}</h4>
      <p><strong>Email:</strong> ${msg.email}</p>
      <p><strong>Message:</strong> ${msg.message}</p>
      <p><strong>Sent:</strong> ${msg.date}</p>
    `;
    messagesList.appendChild(messageCard);
  });
}

// Scroll Animation for Sections
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2, rootMargin: '0px' });

// Fallback: Ensure sections are visible if observer fails
sections.forEach(section => {
  observer.observe(section);
  setTimeout(() => {
    if (!section.classList.contains('visible')) {
      section.classList.add('visible');
    }
  }, 2000);
});

// Back to Top Button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));