/**
 * An array of CSS selectors used to identify advertisement elements on a webpage.
 * These selectors target elements that commonly contain ads, such as divs with
 * class or id attributes containing 'ad' or 'banner', iframes with 'ads' in the
 * source URL, and Google AdSense elements.
 *
 * @type {string[]}
 */
const adSelectors = [
  "div[class*='ad']",
  "iframe[src*='ads']",
  "div[id*='ad']",
  "div[class*='banner']",
  "div[id*='banner']",
  "ins.adsbygoogle",
];

/**
 * A Set to keep track of processed reminders.
 * This ensures that each reminder is processed only once.
 *
 * @type {Set}
 */
const processedReminders = new Set();

/**
 * An array of quote objects.
 * 
 * @type {Array<Object>}
 * @property {string} content - The text of the quote.
 * @property {string} author - The author of the quote.
 * @property {string} tag - The category or tag of the quote.
 */
const quotes = [{
  content: "You are amazing! Keep up the good work!",
  author: "Unknown",
  tag: "motivational",
}];

/**
 * Fetches a random motivational quote from the Quotable API.
 *
 * @async
 * @function fetchMotivationalQuote
 * @returns {Promise<Array<any>>} A promise that resolves to a string containing the quote and its author.
 * @throws Will return a default motivational message if the fetch operation fails.
 */
async function fetchMotivationalQuote() {
  try {
    const response = await fetch(chrome.runtime.getURL("quotes.json"));
    quotes.push(...await response.json());
  } catch (error) {
    console.error("Failed to fetch quote:", error);
  }
}

/**
 * Retrieves the next reminder for today that has not been processed yet.
 *
 * This function filters the reminders to find those scheduled for today and
 * that have not been processed. It then sorts these reminders by time and
 * returns the earliest one. The returned reminder is marked as processed.
 *
 * @returns {Object|null} The next reminder for today, or null if there are no unprocessed reminders.
 */
function getReminder() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("reminders", (data) => {
      const reminders = data.reminders || [];
      const todayReminders = reminders.filter((reminder) => {
        return (
          new Date(reminder.time).toDateString() ===
            new Date().toDateString() && !processedReminders.has(reminder)
        );
      });

      if (todayReminders.length > 0) {
        todayReminders.sort((a, b) => new Date(a.time) - new Date(b.time));
        const reminder = todayReminders[0];
        processedReminders.add(reminder);
        resolve(reminder);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Replaces advertisements on the page with positive content.
 *
 * This function iterates over a list of ad selectors, finds all elements
 * matching each selector, and replaces each ad element with a new div
 * containing positive content.
 *
 * @function replaceAds
 * @global
 */
// Function to replace ads with motivational quotes and reminders
async function replaceAds() {
  adSelectors.forEach(async (selector) => {
    const adElements = document.querySelectorAll(selector);
    for (const adElement of adElements) {
      let content;

      const reminder = await getReminder();
      if (reminder) content = `${reminder.text} (${reminder.time})`;
      else {
        const { content: quote, author } = quotes[Math.floor(Math.random() * quotes.length)];
        content = `"${quote}" - ${author}`;
      }

      const positiveDiv = document.createElement("div");
      positiveDiv.className = "positive-content";
      positiveDiv.textContent = content;
      adElement.replaceWith(positiveDiv);
    }
  });
}

/**
 * Adds an event listener to the window object that triggers the replaceAds function
 * when the page has fully loaded.
 *
 * This ensures that the initial set of advertisements is replaced with positive content
 * as soon as the page load event fires.
 *
 * @event
 */
window.addEventListener("load", async () => {
  await fetchMotivationalQuote();
  await replaceAds();
});

/**
 * Runs the replaceAds function periodically to catch dynamically loaded ads.
 *
 * @function
 * @global
 */
setInterval(replaceAds, 60000);
