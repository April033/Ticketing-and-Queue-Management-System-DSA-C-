/**
 * ============================================================
 * Ticketing and Queue Management System
 * Data Structure: Linear Queue (FIFO) using Array (push & shift)
 * ============================================================
 */

// ------------------------------------------------------------
// 1. STATE VARIABLES
// ------------------------------------------------------------
const waitingQueue = [];         // Array representing the waiting queue
let nextTicketNumber = 1;        // Auto-incrementing counter (1 -> T001, 2 -> T002, etc.)
let currentServingTicket = null; // Holds the ticket currently being served
let totalServedCount = 0;        // Total customers served in this session
let lastGeneratedId = "None";    // Tracks the most recently generated ticket ID

// DOM References
const customerNameInput = document.getElementById("customerNameInput");
const currentTicketDisplay = document.getElementById("currentTicket");
const servingStatusDisplay = document.getElementById("servingStatus");
const statWaitingCount = document.getElementById("statWaitingCount");
const statQueueState = document.getElementById("statQueueState");
const statLastGenerated = document.getElementById("statLastGenerated");
const statTotalServed = document.getElementById("statTotalServed");
const queueCountTag = document.getElementById("queueCountTag");
const queueTrack = document.getElementById("queueTrack");
const statusMessage = document.getElementById("statusMessage");
const activityLog = document.getElementById("activityLog");

// ------------------------------------------------------------
// 2. CORE QUEUE OPERATIONS (DSA IMPLEMENTATION)
// ------------------------------------------------------------

/**
 * Checks if the waiting queue has zero elements.
 * Time Complexity: O(1)
 * @returns {boolean} True if empty, false otherwise.
 */
function isEmpty() {
  return waitingQueue.length === 0;
}

/**
 * Inserts a new ticket at the REAR of the queue.
 * In a JavaScript array, push() appends to the end.
 * 
 * Time Complexity: O(1) amortized
 * @param {Object} ticket - Ticket object { id, name, issuedAt }
 */
function enqueue(ticket) {
  waitingQueue.push(ticket);
}

/**
 * Removes and returns the ticket at the FRONT of the queue.
 * In a JavaScript array, shift() removes index 0 and reindexes
 * all remaining elements by moving them one position to the left.
 * 
 * Time Complexity: O(n) because of element shifting.
 * @returns {Object|null} The ticket from the front, or null if empty.
 */
function dequeue() {
  if (isEmpty()) {
    return null; // Underflow guard
  }
  return waitingQueue.shift();
}

/**
 * Inspects the ticket currently at the FRONT of the queue without removing it.
 * Time Complexity: O(1)
 * @returns {Object|null} The front ticket, or null if empty.
 */
function peek() {
  if (isEmpty()) {
    return null;
  }
  return waitingQueue[0];
}

/**
 * Creates a unique, sequential ticket and enqueues it.
 * Format: T001, T002, T003...
 * 
 * @param {string} customerName - Optional name of the customer
 * @returns {Object} The generated ticket object
 */
function generateTicket(customerName) {
  // Format counter to 3 digits (e.g. 1 -> "001", 12 -> "012")
  const paddedNumber = String(nextTicketNumber).padStart(3, "0");
  const ticketId = `T${paddedNumber}`;
  nextTicketNumber++;

  const newTicket = {
    id: ticketId,
    name: customerName && customerName.trim() !== "" ? customerName.trim() : "Guest",
    issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  // Add the newly created ticket to the rear of the queue
  enqueue(newTicket);
  lastGeneratedId = ticketId;

  return newTicket;
}

/**
 * Resets the entire ticketing system to its initial state.
 */
function resetSystem() {
  waitingQueue.length = 0;       // Empty the queue array
  nextTicketNumber = 1;          // Reset ticket sequence to T001
  currentServingTicket = null;   // Clear current counter
  totalServedCount = 0;          // Reset served counter
  lastGeneratedId = "None";      // Clear last ticket ID
}

// ------------------------------------------------------------
// 3. UI EVENT HANDLERS
// ------------------------------------------------------------

/**
 * Triggered when user clicks "Generate Ticket".
 */
function handleGenerateTicket() {
  const enteredName = customerNameInput.value;
  const ticket = generateTicket(enteredName);

  // Clear input box
  customerNameInput.value = "";
  customerNameInput.focus();

  // Re-render UI
  displayQueue();

  // Show status feedback and log
  showBanner(`Issued ticket <strong>${ticket.id}</strong> for <em>${ticket.name}</em>. Added to REAR.`, "success");
  addLog(`[ISSUED] Ticket ${ticket.id} (${ticket.name}) joined at position #${waitingQueue.length}.`, "generate");
}

/**
 * Triggered when operator clicks "Serve Next Customer".
 */
function handleServeNext() {
  // Empty Queue Guard
  if (isEmpty()) {
    showBanner("The waiting queue is currently empty. No customers to serve.", "warning");
    addLog("[WARN] Cannot serve: Waiting queue is empty.", "warn");
    return;
  }

  // FIFO Removal: Dequeue from the FRONT
  const servedTicket = dequeue();
  currentServingTicket = servedTicket;
  totalServedCount++;

  // Re-render UI
  displayQueue();

  // Show status feedback and log
  showBanner(`Now serving <strong>${servedTicket.id}</strong> (${servedTicket.name}). Next customer moved to FRONT.`, "info");
  addLog(`[SERVED] Ticket ${servedTicket.id} (${servedTicket.name}) called to counter. Remaining in queue: ${waitingQueue.length}.`, "serve");
}

/**
 * Triggered when user clicks "Reset System".
 */
function handleReset() {
  const confirmed = confirm("Are you sure you want to reset the system? All waiting tickets and counter data will be cleared.");
  if (!confirmed) {
    return;
  }

  resetSystem();
  displayQueue();

  showBanner("Ticketing system has been successfully reset to initial state.", "info");
  addLog("[RESET] System state cleared. Next ticket will be T001.", "reset");
}

// ------------------------------------------------------------
// 4. RENDERING & SYNCHRONIZATION
// ------------------------------------------------------------

/**
 * Synchronizes the visual DOM representation with the underlying waitingQueue array.
 */
function displayQueue() {
  // 1. Update Serving Counter Display
  if (currentServingTicket) {
    currentTicketDisplay.textContent = currentServingTicket.id;
    servingStatusDisplay.textContent = `Serving: ${currentServingTicket.name} (Issued: ${currentServingTicket.issuedAt})`;
  } else {
    currentTicketDisplay.textContent = "---";
    servingStatusDisplay.textContent = "No customer currently at counter";
  }

  // 2. Update Statistics Indicators
  statWaitingCount.textContent = waitingQueue.length;
  queueCountTag.textContent = `${waitingQueue.length} Waiting`;
  statLastGenerated.textContent = lastGeneratedId;
  statTotalServed.textContent = totalServedCount;

  if (isEmpty()) {
    statQueueState.textContent = "EMPTY";
    statQueueState.className = "stat-value state-badge empty";
  } else {
    statQueueState.textContent = "ACTIVE";
    statQueueState.className = "stat-value state-badge active";
  }

  // 3. Render Visual Waiting Queue Track
  queueTrack.innerHTML = "";

  if (isEmpty()) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "The queue is currently empty. Generated tickets will appear here in arrival order.";
    queueTrack.appendChild(emptyMessage);
    return;
  }

  // Loop through queue elements in arrival (FIFO) order:
  // index 0 is FRONT, index length - 1 is REAR
  for (let i = 0; i < waitingQueue.length; i++) {
    const item = waitingQueue[i];
    const isFront = (i === 0);
    const isRear = (i === waitingQueue.length - 1);

    const card = document.createElement("div");
    card.className = "ticket-card";

    if (isFront) card.classList.add("is-front");
    if (isRear) card.classList.add("is-rear");

    // Position label #1, #2, ...
    const posLabel = document.createElement("span");
    posLabel.className = "ticket-pos";
    posLabel.textContent = `Position #${i + 1}`;
    card.appendChild(posLabel);

    // Ticket ID (e.g. T001)
    const idLabel = document.createElement("span");
    idLabel.className = "ticket-id";
    idLabel.textContent = item.id;
    card.appendChild(idLabel);

    // Customer Name
    const nameLabel = document.createElement("span");
    nameLabel.className = "ticket-customer";
    nameLabel.textContent = item.name;
    nameLabel.title = item.name;
    card.appendChild(nameLabel);

    // FRONT / REAR pointers
    if (isFront && isRear) {
      const tag = document.createElement("span");
      tag.className = "ticket-pointer pointer-both";
      tag.textContent = "FRONT & REAR";
      card.appendChild(tag);
    } else if (isFront) {
      const tag = document.createElement("span");
      tag.className = "ticket-pointer pointer-front";
      tag.textContent = "FRONT";
      card.appendChild(tag);
    } else if (isRear) {
      const tag = document.createElement("span");
      tag.className = "ticket-pointer pointer-rear";
      tag.textContent = "REAR";
      card.appendChild(tag);
    }

    queueTrack.appendChild(card);
  }
}

/**
 * Displays user-friendly alert banner.
 * @param {string} message - HTML or text to display
 * @param {string} type - 'info' | 'success' | 'warning' | 'danger'
 */
function showBanner(message, type = "info") {
  statusMessage.className = `status-banner ${type}`;
  statusMessage.innerHTML = message;
}

/**
 * Adds an entry to the visual activity log.
 * @param {string} text - Message text
 * @param {string} type - Entry category class
 */
function addLog(text, type = "system") {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const li = document.createElement("li");
  li.className = `log-entry ${type}`;
  li.textContent = `[${time}] ${text}`;

  // Prepend so the newest event is at top
  activityLog.insertBefore(li, activityLog.firstChild);
}

/**
 * Clears the activity log list.
 */
function clearLog() {
  activityLog.innerHTML = "";
  const li = document.createElement("li");
  li.className = "log-entry system";
  li.textContent = "[SYSTEM] Activity log cleared.";
  activityLog.appendChild(li);
}

// Allow pressing Enter inside the customer name input to generate a ticket
customerNameInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleGenerateTicket();
  }
});

// Initial render when the script loads
displayQueue();