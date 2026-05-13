const currentDate = document.getElementById("currentDate");
const daysContainer = document.getElementById("daysContainer");

const today = new Date();

const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const months = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

// Aktuelles Datum anzeigen
currentDate.textContent =
  `📅 ${weekdays[today.getDay()]}, ${today.getDate()}. ${months[today.getMonth()]}`;

// 5 Tage anzeigen
for (let i = 0; i < 5; i++) {
  const date = new Date();
  date.setDate(today.getDate() + i);

  const dayBox = document.createElement("div");

  dayBox.classList.add("day");

  if (i === 0) {
    dayBox.classList.add("active");
  }

  dayBox.innerHTML = `
    <span>${weekdays[date.getDay()]}</span>
    <strong>${date.getDate()}</strong>
  `;

  daysContainer.appendChild(dayBox);
}