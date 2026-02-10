const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealEls.forEach((el) => observer.observe(el));

const heroPanel = document.querySelector(".hero-panel");
const heroContent = document.querySelector(".poster-content");
if (heroPanel && heroContent) {
  const maxShift = 8;
  heroPanel.addEventListener("mousemove", (event) => {
    const rect = heroPanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const tx = x * maxShift;
    const ty = y * maxShift;
    heroContent.style.transform = `translate(${tx}px, ${ty}px)`;
  });

  heroPanel.addEventListener("mouseleave", () => {
    heroContent.style.transform = "translate(0, 0)";
  });
}

const form = document.getElementById("waitlist-form");
const note = document.getElementById("form-note");

if (form && note) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      note.textContent = "请先填写你的称呼。";
      return;
    }

    note.textContent = `已收到，${name}。我们会尽快发送体验资格。`;
    form.reset();
  });
}
