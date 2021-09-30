// create vairable to hold db connection
let db;
// establish a connection to IndexDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the databace version changes (nonexistant to version 1, v1, to v2, etc.)
request.onupgradeneeded = function(event) {
    console.log('4567', event);
    // save a reference to the database
    db = event.target.result
    // create an object store (table) called 'new_budget', set it to have an auti incrementing primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    console.log('onsuccess', event);
    // When db is successfully created with its object store (from opupgradeneeded event above) or simply established a connection, save reference to db in global variable.
    db = event.target.result;

    // check if app is online; if it is send saved local data to api
    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log('There was an error', event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(data) {
    console.log('saveRecord', data);
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add the data to the object store for posting later
    budgetObjectStore.add(data);
};

function uploadBudget() {
    console.log('uploadBudget');
    // open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all data from the store and set to a variable
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in indexedDB's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');

                // access the new_budget object store
                const budgetObjectStore = transaction.objectStore('new_budget');

                // clear all items in your store
                budgetObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

// listen for an internet connection
window.addEventListener('online', uploadBudget);