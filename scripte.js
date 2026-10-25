const TOTAL_SEATS = 20;
const TICKET_PRICE = 80;
const STORAGE_KEY = "busdirect_seats";
let seats = [];
document.addEventListener("DOMContentLoaded", function () {
  loadState();
  renderAll();
  document.getElementById("form-reserve").addEventListener("submit", function (event) {
    event.preventDefault();
    reserveSeat();
  });
  document.getElementById("search-ticket").addEventListener("input", function () {
    renderTickets();
  });
  document.getElementById("form-delete").addEventListener("submit", function (event) {
  event.preventDefault();
  deleteReservation();
});
});
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
function findFirstFreeSeat() {
  for (let i = 0; i < seats.length; i++) {
    if (seats[i].occupied === false) {
      return seats[i].id;
    }
  }
  return null;
}
function reserveSeat() {
  let name = document.getElementById("reserve-name").value.trim();
  let select = document.getElementById("reserve-seat-select");
  let seatId;
  if (name === "") {
    showMessage("msg-reserve", "Le nom est obligatoire.", false);
    return;
  }
  for (let i = 0; i < seats.length; i++) {
    if (
      seats[i].occupied === true &&
      seats[i].passenger.toLowerCase() === name.toLowerCase()
    ) {
      showMessage("msg-reserve", "Ce nom existe déjà.", false);
      return;
    }
  }
  if (select.value === "") {
    seatId = findFirstFreeSeat();
  } else {
    seatId = Number(select.value);
  }
  if (seatId === null) {
    showMessage("msg-reserve", "Aucun siège libre.", false);
    return;
  }
  for (let i = 0; i < seats.length; i++) {
    if (seats[i].id === seatId) {
      if (seats[i].occupied === true) {
        showMessage("msg-reserve", "Ce siège est occupé.", false);
        return;
      }
      seats[i].occupied = true;
      seats[i].passenger = name;
      saveState();
      renderAll();
      document.getElementById("form-reserve").reset();
      showMessage("msg-reserve", "Réservation réussie !", true);
      return;
    }
  }
}
function updateDropdowns() {
  let reserveSelect = document.getElementById("reserve-seat-select");
  let editSelect = document.getElementById("edit-seat-select");
  let passengerSelect = document.getElementById("edit-passenger-select");
  let deleteSelect = document.getElementById("delete-passenger-select");

  reserveSelect.innerHTML = '<option value="">Choisir un siège</option>';
  editSelect.innerHTML = '<option value="">Garder le même siège</option>';
  passengerSelect.innerHTML = '<option value="">Choisir un passager</option>';
  deleteSelect.innerHTML = '<option value="">Choisir un passager</option>';

  for (let i = 0; i < seats.length; i++) {
    let seat = seats[i];
    if (seat.occupied === false) {
      let option = document.createElement("option");
      option.value = seat.id;
      option.textContent = "Siège #" + seat.id;
      reserveSelect.appendChild(option);

      let editOption = document.createElement("option");
      editOption.value = seat.id;
      editOption.textContent = "Siège #" + seat.id;
      editSelect.appendChild(editOption);
    } else {
      let option = document.createElement("option");
      option.value = seat.passenger;
      option.textContent = seat.passenger;
      passengerSelect.appendChild(option);

      let deleteOption = document.createElement("option");
      deleteOption.value = seat.passenger;
      deleteOption.textContent = seat.passenger;
      deleteSelect.appendChild(deleteOption);
    }
  }
}
function updateKPIs() {
  let available = 0;
  let revenue = 0;
  for (let i = 0; i < seats.length; i++) {
    if (seats[i].occupied === false) {
      available++;
    } else {
      revenue = revenue + TICKET_PRICE;
    }
  }
  document.getElementById("header-available-count").textContent = available;
  document.getElementById("header-total-revenue").textContent = revenue + " DH";
  let alert = document.getElementById("full-bus-alert");
  if (alert) {
    if (available === 0) {
      alert.classList.remove("hidden");
    } else {
      alert.classList.add("hidden");
    }
  }
}
function renderTickets() {
  let container = document.getElementById("tickets-container");
  let emptyMessage = document.getElementById("no-tickets-msg");
  let search = document.getElementById("search-ticket");
  container.innerHTML = "";
  let count = 0;
  let searchText = search.value.toLowerCase();
  for (let i = 0; i < seats.length; i++) {
    let seat = seats[i];

    if ( seat.occupied === true && seat.passenger.toLowerCase().includes(searchText)
    ) {
      let ticket = document.createElement("div");
      ticket.className = "p-4 rounded-xl border mb-3";
      ticket.textContent ="Passager : " + seat.passenger +" - Siège #" + seat.id +" - Prix : " + TICKET_PRICE + " DH";
      container.appendChild(ticket);
      count++;
    }
  }
  if (count === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }
}
function showMessage(id, message, success) {
  let element = document.getElementById(id);
  if (element === null) {
    return;
  }
  element.textContent = message;
  if (success === true) {
    element.className = "text-green-600";
  } else {
    element.className = "text-red-600";
  }
  setTimeout(function () {
    element.textContent = "";
  }, 3000);
}
function deleteReservation() {
  let name = document.getElementById("delete-passenger-select").value;
  if (name === "") {
    showMessage("msg-delete", "Choisir un passager.", false);
    return;
  }
  for (let i = 0; i < seats.length; i++) {
    if (seats[i].passenger === name) {
      seats[i].occupied = false;
      seats[i].passenger = "";
      saveState();
      renderAll();
      showMessage("msg-delete", "Réservation supprimée !", true);
      return;
    }
  }
}