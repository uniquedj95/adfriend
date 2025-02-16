/**
 * Loads reminders from Chrome's synchronized storage and displays them in the reminders list.
 * 
 * This function retrieves the "reminders" array from Chrome's storage and populates the 
 * inner HTML of the element with the ID "remindersList" with the reminders. Each reminder 
 * is displayed as a list item with its text and time.
 */
function loadReminders() {
  chrome.storage.sync.get("reminders", (data) => {
    const reminders = data.reminders || [];
    const remindersList = document.getElementById("remindersList");
    remindersList.innerHTML = reminders
      .map((reminder) => `<li>${reminder.text} (${ reminder.time })</li>`)
      .join("");
  });
}


/**
 * Adds an event listener to the "saveReminderButton" element that saves a new reminder 
 * to Chrome's synchronized storage when clicked.
 * 
 * This function retrieves the input values for the reminder text and time, adds the new 
 * reminder to the existing "reminders" array in Chrome's storage, and then updates the 
 * storage with the new array. After saving, it reloads the reminders list and clears the 
 * input fields.
 */
document.getElementById("saveReminderButton").addEventListener("click", () => {
  const reminderInput = document.getElementById("reminderInput").value;
  const reminderDatetime = document.getElementById("reminderDatetime").value;
  if (reminderInput && reminderDatetime) {
    chrome.storage.sync.get("reminders", (data) => {
      const reminders = data.reminders || [];
      reminders.push({ text: reminderInput, time: reminderDatetime });
      chrome.storage.sync.set({ reminders }, () => {
        loadReminders();
        document.getElementById("reminderInput").value = "";
        document.getElementById("reminderDatetime").value = "";
      });
    });
  }
});

/**
 * Initializes the reminders list by loading existing reminders from Chrome's storage.
 * 
 * This function is called when the popup is loaded to ensure that any previously saved 
 * reminders are displayed in the reminders list.
 */
loadReminders();