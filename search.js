// חיפוש וסינון
document.querySelector("#searchBar").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const cards = document.querySelectorAll(".template-card");

  cards.forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const description = card.querySelector("p").textContent.toLowerCase();
    const tags = Array.from(card.querySelectorAll(".tag"))
      .map((tag) => tag.textContent.toLowerCase())
      .join(" ");

    // בדיקה אם מילת החיפוש נמצאת בכותרת, תיאור או תגיות
    const isMatch =
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      tags.includes(searchTerm);

    card.style.display = isMatch ? "block" : "none";
  });
});
