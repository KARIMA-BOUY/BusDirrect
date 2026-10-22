
const TOTAL_SEATS = 20;
const TICKET_PRICE = 80;
const STORAGE_KEY = "busdirect_seats";
let seats = [];
document.addEventListener("DOMContentLoaded", function () {
  loadState();
  renderAll();
})
function createEmptySeats() {
  seats = [];
  for (let i = 1; i <= TOTAL_SEATS; i++) {
    seats.push({
      id: i,
      occupied: false,
      passenger: ""
    });
  }
}
function loadState() {
  let data = localStorage.getItem(STORAGE_KEY);
  if (data === null) {
    createEmptySeats();
  } else {
    seats = JSON.parse(data);
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
}
function renderAll() {
  renderCabinGrid();
  updateDropdowns();
  updateKPIs();
  renderTickets();
}
function renderCabinGrid() {
  let grid = document.getElementById("bus-cabin-grid");
  grid.innerHTML = "";
  for (let i = 0; i < seats.length; i++) {
    let seat = seats[i];
    let card = document.createElement("div");
    card.className = "p-3 rounded-xl border-2 text-center";
    if (seat.occupied === true) {
      card.textContent = "Siège #" + seat.id + " - " + seat.passenger;
      card.className += " bg-rose-100 border-rose-400";
    } else {
      card.textContent = "Siège #" + seat.id + " - Libre";
      card.className += " bg-emerald-50 border-emerald-400";
    }
    grid.appendChild(card);
  }
}
function validation(){
  let nom=document.getElementById("reserve-name").value.trim();
  if(nom===""){
    alert("le nom est obligatoire");
    return;
  }  
}
