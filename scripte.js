
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
  document.getElementById("form-delete").addEventListener("submit", function (event) {
    event.preventDefault();
    deleteReservation();
  });
  document.getElementById("form-edit").addEventListener("submit", function (event) {
    event.preventDefault();
    editReservation();
  });
});
function createSeats() {
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
    createSeats();
  } else {
    seats = JSON.parse(data);
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
}
function renderAll() {
  renderSeats();
  updateSelects();
  updateKPIs();
  renderTickets();
}
function renderSeats() {
  let grid = document.getElementById("bus-cabin-grid");
  grid.innerHTML = "";
  seats.forEach(function (seat) {
    let card = document.createElement("div");
    card.className = "p-3 rounded-xl border-2 text-center";
    if (seat.occupied) {
      card.className += " bg-rose-100 border-rose-400";
      card.textContent = "Siège #" + seat.id + " - " + seat.passenger;
    } else {
      card.className += " bg-emerald-50 border-emerald-400";
      card.textContent = "Siège #" + seat.id + " - Libre";
    }
    grid.appendChild(card);
  });
}
function findFreeSeat() {
  return seats.find(function (seat) {
    return seat.occupied === false;
  });
}
function reserveSeat() {
  let name = document.getElementById("reserve-name").value.trim();
  let selectedId = document.getElementById("reserve-seat-select").value;
  if (name === "") {
    showMessage("msg-reserve", "Le nom est obligatoire.");
    return;
  }
  let exists = seats.some(function (seat) {
    return seat.occupied &&
      seat.passenger.toLowerCase() === name.toLowerCase();
  });
  if (exists) {
    showMessage("msg-reserve", "Ce nom existe déjà.");
    return;
  }
  let seat;
  if (selectedId === "") {
    seat = findFreeSeat();
  } else {
    seat = seats.find(function (seat) {
      return seat.id === Number(selectedId);
    });
  }
  if (!seat || seat.occupied) {
    showMessage("msg-reserve", "Aucun siège libre.");
    return;
  }
  seat.occupied = true;
  seat.passenger = name;
  saveState();
  renderAll();
  document.getElementById("form-reserve").reset();
  showMessage("msg-reserve", "Réservation réussie !");
}
function updateSelects() {
  let reserveSelect = document.getElementById("reserve-seat-select");
  let editSelect = document.getElementById("edit-seat-select");
  let editPassenger = document.getElementById("edit-passenger-select");
  let deletePassenger = document.getElementById("delete-passenger-select");

  reserveSelect.innerHTML = '<option value="">Choisir un siège</option>';
  editSelect.innerHTML = '<option value="">Garder le même siège</option>';
  editPassenger.innerHTML = '<option value="">Choisir un passager</option>';
  deletePassenger.innerHTML = '<option value="">Choisir un passager</option>';

  let freeSeats = seats.filter(function (seat) {
    return !seat.occupied;
  });
  let occupiedSeats = seats.filter(function (seat) {
    return seat.occupied;
  });
  freeSeats.forEach(function (seat) {
    reserveSelect.innerHTML +=
      '<option value="' + seat.id + '">Siège #' + seat.id + '</option>';
    editSelect.innerHTML +=
      '<option value="' + seat.id + '">Siège #' + seat.id + '</option>';
  });
  occupiedSeats.forEach(function (seat) {
    editPassenger.innerHTML +='<option value="' + seat.passenger + '">' + seat.passenger + '</option>';
    deletePassenger.innerHTML +='<option value="' + seat.passenger + '">' + seat.passenger + '</option>';
  });
}
function updateKPIs() {
  let freeSeats = seats.filter(function (seat) {
    return !seat.occupied;
  });
  let occupiedSeats = seats.filter(function (seat) {
    return seat.occupied;
  });
  document.getElementById("header-available-count").textContent = freeSeats.length;
  document.getElementById("header-total-revenue").textContent =
    occupiedSeats.length * TICKET_PRICE + " DH";
}
function renderTickets() {
  let container = document.getElementById("tickets-container");
  let emptyMessage = document.getElementById("no-tickets-msg");
  let search = document.getElementById("search-ticket").value.toLowerCase();

  container.innerHTML = "";
  let tickets = seats.filter(function (seat) {
    return seat.occupied &&
      seat.passenger.toLowerCase().includes(search);
  });
  tickets.forEach(function (seat) {
    let ticket = document.createElement("div");
    ticket.className = "p-4 rounded-xl border mb-3";
    ticket.textContent =
      "Passager : " + seat.passenger +
      " - Siège #" + seat.id +
      " - Prix : " + TICKET_PRICE + " DH";
    container.appendChild(ticket);
  });
  if (tickets.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }
}
function showMessage(id, message) {
  let element = document.getElementById(id);
  element.textContent = message;
  element.classList.remove("hidden");
  setTimeout(function () {
    element.textContent = "";
    element.classList.add("hidden");
  }, 3000);
}
function editReservation() {
  let oldName = document.getElementById("edit-passenger-select").value;
  let newName = document.getElementById("edit-name").value.trim();
  let newSeatId = document.getElementById("edit-seat-select").value;
  if (oldName === "" || newName === "") {
    showMessage("msg-edit", "Remplir les informations.");
    return;
  }
  let exists = seats.some(function (seat) {
    return seat.occupied &&
      seat.passenger.toLowerCase() === newName.toLowerCase() &&
      seat.passenger !== oldName;
  });
  if (exists) {
    showMessage("msg-edit", "Ce nom existe déjà.");
    return;
  }
  let oldSeat = seats.find(function (seat) {
    return seat.occupied && seat.passenger === oldName;
  });
  if (!oldSeat) {
    showMessage("msg-edit", "Passager introuvable.");
    return;
  }
  if (newSeatId !== "") {
    let newSeat = seats.find(function (seat) {
      return seat.id === Number(newSeatId);
    });
    if (!newSeat || newSeat.occupied) {
      showMessage("msg-edit", "Siège indisponible.");
      return;
    }
    oldSeat.occupied = false;
    oldSeat.passenger = "";
    newSeat.occupied = true;
    newSeat.passenger = newName;
  } else {
    oldSeat.passenger = newName;
  }
  saveState();
  renderAll();
  document.getElementById("form-edit").reset();
  showMessage("msg-edit", "Modification réussie !");
}
function deleteReservation() {
  let name = document.getElementById("delete-passenger-select").value;
  if (name === "") {
    showMessage("msg-delete", "Choisir un passager.");
    return;
  }
  let seat = seats.find(function (seat) {
    return seat.occupied && seat.passenger === name;
  });
  if (!seat) {
    showMessage("msg-delete", "Passager introuvable.");
    return;
  }
  seat.occupied = false;
  seat.passenger = "";
  saveState();
  renderAll();
  document.getElementById("form-delete").reset();
  showMessage("msg-delete", "Réservation supprimée !");
}
