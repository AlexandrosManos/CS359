// password field
const showPassword = document.getElementById("ShowPassword");
let URLch = "UpdateIncident";
let idName = "incident_id";

/**
 * This function is used to create a semi pop-up form
 * And using a number and some data about the incident
 * It allocates it to the system
 * @constructor
 */

function MakeForm(){
    var form = document.getElementById("Fire_Form");
    if(form.style.display === "none"){
        form.style.display = "block";
    }else{
        form.style.display = "none";
    }
}

/**
 * This function is used to create a dynamic table for the data
 * after a successfull AJAX request.
 * @param id
 * @param data
 * @returns {string}
 */
function createTableFromJSON(id,data) {
    var html = "<div class='table-container' id='" + id + "'>";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";

    for (const key in data) {
        var category = key;
        var value = data[key];
        html += `<tr><td>${category}</td><td contenteditable="false">${value}</td></tr>`;
    }
    html += `
        </table>
        <button class="edit-button" onclick="makeTableEditable(this)">Edit</button>`;
    html += `</div><br>`;
    return html;
}



function makeTableEditable(button) {
    const table = button.previousElementSibling;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index === 1) {
            return;
        }
        const categoryCell = row.cells[0];
        const valueCell = row.cells[1];
        if (categoryCell.textContent.trim() !== "Category") {
            valueCell.contentEditable = "true";
            valueCell.style.backgroundColor = "#ffffcc";
        }
        valueCell.setAttribute('data-original-value', valueCell.textContent.trim());

    });
    button.textContent = "Save";
    button.setAttribute("onclick", "saveTableChanges(this)");
}

async function saveTableChanges(button) {

    const table = button.previousElementSibling;
    const rows = table.querySelectorAll('tr');
    let changes = [];
    // get the id
    const id = button.closest(".table-container").id;

    try {
        // Αλλαξέ το --> αμα υπάρχει lat και lon, δεν είναι 0
        // και αμα έχει γίνει κάποια αλλαγή στο address κλπ
        if (URLch !== "UpdateMessage" && URLch !== "EditParticipants")
            await addressCheck(id);

        rows.forEach((row, index) => {
            if (index > 0) {
                const categoryCell = row.cells[0];
                const valueCell = row.cells[1];
                const originalValue = valueCell.getAttribute('data-original-value');
                const newValue = valueCell.textContent.trim();

                if (originalValue !== newValue ) {
                    const change = {};
                    change[categoryCell.textContent.trim()] = newValue;
                    changes.push(change);
                }
            }
        });

        if (changes.length <= 0) {
            console.log("No changes");
        }else
        {
            // console.log(changes);
        }
    } catch (error) {
        console.error("Failed to update lat/lon:", error);
    } finally {
        const cells = table.querySelectorAll('td:nth-child(2)');
        cells.forEach(cell => {
            cell.contentEditable = "false";
            cell.style.backgroundColor = "";
        });

        button.textContent = "Edit";
        button.setAttribute("onclick", "makeTableEditable(this)");
        sendChangesToServer(id, changes);
    }

}

function sendChangesToServer(id, changes) {
    var data = {
        [idName]: id
    };
    changes.forEach(function(change) {
        for (var key in change) {
            data[key] = change[key];  // Εισάγουμε το πεδίο vehicles ή άλλα πεδία
        }
    });
    const serializedData = Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');
    // console.log("sada "+serializedData);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // console.log("Send changes to server --> status 200");
        } else if (xhr.status !== 200) {
            alert('Request failed. Returned status of ' + xhr.status);
        }
        // window.location.reload();

    };
    xhr.open('POST', URLch);
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(serializedData);
}
async function addressCheck(tableId) {
    return new Promise((resolve, reject) => {
        const data = null;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        const table = document.getElementById(tableId);
        let address = "";
        if (!table) {
            console.error(`Table with id ${tableId} not found.`);
            return reject(`Table with id ${tableId} not found.`);
        }

        // Find the address
        const rows = table.querySelectorAll('tr');
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length === 2) {
                const key = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();
                if (key === "address" || key === "prefecture") {
                    address += value + " ";
                }
            }
        }
        // Add the country (only in Greece)
        address += "Greece";
        // console.log(`address ${address}`);

        xhr.addEventListener("readystatechange", function () {
            try {
                if (this.readyState === this.DONE) {
                    const obj = JSON.parse(xhr.responseText);
                    // Non-empty list
                    if (obj && obj.length > 0) {
                        const location = obj[0];
                        const lat = location.lat;
                        const lon = location.lon;

                        for (let i = 1; i < rows.length; i++) {
                            const cells = rows[i].querySelectorAll('td');
                            if (cells.length === 2) {
                                const key = cells[0].textContent.trim();
                                if (key === "lat") {
                                    cells[1].textContent = lat;
                                }
                                if (key === "lon") {
                                    cells[1].textContent = lon;
                                }
                            }
                        }
                        resolve();
                    } else {
                        reject("No location data found.");
                    }
                }
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });

        xhr.open("GET", "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" + address + "&acceptlanguage=en&polygon_threshold=0.0");
        xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');
        var key = "b56dfa5a0cmsh3ec4a774dabe721p1ccdfejsnc1ea3a886cdb";
        xhr.setRequestHeader("x-rapidapi-key", key);
        xhr.send(data);
    });
}


/**

 This function runs within the loading of this Page
 It sends a Ajax Request to get the incidents
 with status = running
 It will return the incident_type , description,Address and date
 It will than Create a table dynamically
 @constructor**/

function RunningIncidents() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            const container = document.getElementById("incident-container");
            container.innerHTML = "";

            for(let id in obj){
                const data = obj[id]; // Παίρνουμε το αντικείμενο δεδομένων
                // document.getElementById("msg").innerHTML += createTableFromJSON(data);
                URLch = "UpdateIncident";
                idName = "incident_id";
                container.innerHTML += createTableFromJSON(data.incident_id,data);
            }


        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', 'RunningIncidents', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function ShowHomePage() {
    const HomePage = document.getElementById("GeneralAdminPage");
    HideDisplays();
    HomePage.style.display = 'flex';

}
function HideDisplays(){
    const HomePage = document.getElementById("GeneralAdminPage");
    const AllInc  = document.getElementById("AllIncidents");
    const AllUsers  = document.getElementById("AllUsers");
    const AllMessages  = document.getElementById("AllMessages");
    const AllParticipants = document.getElementById("AllParticipants");
    const IncStats = document.getElementById("IncStats");

    HomePage.style.display = 'none';
    AllInc.style.display = 'none';
    AllUsers.style.display = 'none';
    AllMessages.style.display = 'none';
    AllParticipants.style.display = 'none';
    IncStats.style.display = 'none';
}
function AllIncidents() {
    HideDisplays();
    const AllInc  = document.getElementById("AllIncidents");
    AllInc.style.display = 'flex';

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            const container = document.getElementById("AllIncidents");
            container.innerHTML = "";
            for(let id in obj){
                const data = obj[id];
                // document.getElementById("msg").innerHTML += createTableFromJSON(data);
                URLch = "UpdateIncident";
                idName = "incident_id";
                container.innerHTML += createTableFromJSON(data.incident_id,data);
            }


        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', 'IncidentsServlet', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}

function AllUsers(Utype){
    HideDisplays();
    const AllU  = document.getElementById("AllUsers");
    AllU.style.display = 'flex';
    const url = Utype + "Servlet";
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            AllU.innerHTML = "";
            for(let id in obj){
                const data = obj[id];
                // document.getElementById("msg").innerHTML += createTableFromJSON(data);
                if (Utype === "users")
                {
                    AllU.innerHTML += createTableFromJSON(data.user_id,data);
                    idName = "user_id";
                }
                else
                {
                    AllU.innerHTML += createTableFromJSON(data.volunteer_id,data);
                    idName = "volunteer_id";
                }
                URLch = "AdminEditUsers";

            }

        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function AllMessages() {
    HideDisplays();
    const AllMes  = document.getElementById("AllMessages");
    AllMes.style.display = 'flex';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);

            AllMes.innerHTML = "";



            const incidentContainers = GroupByIncidentIdAndSecondary(obj, 'recipient');
            incidentContainers.forEach(({ id, container }) => {
                // Filter messages that belong to the current incident_id
                obj.filter(message => {
                    if (message.incident_id === -1 && message.sender != 'admin') {
                        return `${message.incident_id}-${message.sender}` === id;
                    }
                    return `${message.incident_id}-${message.recipient}` === id;
                })
                    .forEach(message => {
                        URLch = "UpdateMessage";
                        idName = "message_id";
                        const tableHtml = createTableFromJSON(message.message_id, message);
                        container.innerHTML += tableHtml;
                    });
                AllMes.appendChild(container);
            });

            const newMessageDiv = document.createElement('div');
            newMessageDiv.id = "NewMessage";

            const button = document.createElement('button');
            button.textContent = "Add New Message";

            button.setAttribute('onclick', 'showModal()');

            newMessageDiv.appendChild(button);
            AllMes.appendChild(newMessageDiv);

        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', 'UpdateMessage', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}

function AllParticipants() {
    HideDisplays();
    const AllPar  = document.getElementById("AllParticipants");
    AllPar.style.display = 'flex';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            AllPar.innerHTML = "";

            const incidentContainers = GroupByIncidentIdAndSecondary(obj, 'volunteer_type');;

            incidentContainers.forEach(({ id, container }) => {
                // Filter messages that belong to the current incident_id
                obj.filter(participant => `${participant.incident_id}-${participant.volunteer_type}` === id)
                    .forEach(participant => {
                        URLch = "EditParticipants";
                        idName = "participant_id";
                        const tableHtml = createTableFromJSON(participant.participant_id, participant);
                        container.innerHTML += tableHtml;
                    });
                AllPar.appendChild(container);
            });

        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', 'AllParticipants', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}

// Group the data by the incident_id
function GroupByIncidentId(data) {
    const groupedByIncidentId = data.reduce((group, comp) => {
        const incidentId = comp.incident_id;
        if (!group[incidentId]) {
            group[incidentId] = [];
        }
        group[incidentId].push(comp);
        return group;
    }, {});

    // An array to store containers for each incident_id
    const containers = [];


    for (const incidentId in groupedByIncidentId) {
        const incidentContainer = document.createElement("div");
        incidentContainer.classList.add("incident-container");
        incidentContainer.id = `incident-${incidentId}`;

        const header = document.createElement("h3");
        header.textContent = `Incident ID: ${incidentId}`;
        incidentContainer.appendChild(header);

        // Store the container with its ID in the array
        containers.push({id: incidentId, container: incidentContainer});
    }
    return containers;
}
function GroupByIncidentIdAndSecondary(data, param = null) {
    // Group the data based incident_id and recipient secondary key -> param
    const groupedBy = data.reduce((group, comp) => {
        // Key combining incident_id and param
        let key;
        if (comp.incident_id == -1)
        {
            if (comp.sender === 'admin') {
                key = `${comp.incident_id}-${comp.recipient}`; // Admin responds to recipient
            } else {
                key = `${comp.incident_id}-${comp.sender}`; // Other users send messages
            }
        }
        else
            key = param ? `${comp.incident_id}-${comp[param] || "undefined"}` : `${comp.incident_id}`;

        if (!group[key]) {
            group[key] = [];
        }
        group[key].push(comp);
        return group;
    }, {});
    //An array to store containers each combination
    const containers = [];
    // console.log(groupedBy);
    for (const key in groupedBy) {
        // Split incident_id and param
        const [incidentId, type] = key.split('-');
        const cont = document.createElement("div");
        cont.classList.add("incident-container");
        cont.id = `incident-${key}`;

        const head = document.createElement("h2");
        if (!key.startsWith('-1'))
            head.textContent = param ? `Incident ID: ${incidentId} - ${param}: ${type}` : `Incident ID: ${incidentId}`;
        else
            head.textContent =`Support:`;

        cont.appendChild(head);

        containers.push({ id: key, container: cont });
    }
    return containers;
}



function showModal() {
    //
    $("#Modal").load("SendMessageModal.html?timestamp=" + new Date().getTime(), function() {
        addIncidentInput();
    });
}
function CloseModal(){
    $("#Modal").empty();
}

function SendMessage(){
    var sender = "admin"
    var formData = {
        incident_id: $('#incident_id').val(),
        message: $('#message').val(),
        sender: sender,
        recipient:$('#recipient').val() === 'personal' ? $('#Username').val() : $('#recipient').val()
    }
    var data = JSON.stringify(formData);
    // console.log(data);
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //     ...
        } else if (xhr.status !== 200) {
            alert("Message was not send!, error status:" + xhr.status);
        }
        CloseModal();

    };

    xhr.open('POST', 'NewMessage');
    xhr.setRequestHeader('Content-type','application/json');
    xhr.send(data);
}
function addIncidentInput() {
    var label = $('<label for="incident_id">Incident_id:</label>');
    var input = $('<input type="number" id="incident_id" name="incident_id">');

    $('#MessageForm').prepend(input);
    $('#MessageForm').prepend(label);

    $('#recipient').append($('<option>', {value: "personal",text: 'Personal'}));

    $('#recipient').on('change', function () {
        var selectedValue = $(this).val();
        var personalInputContainer = $('#RecipientName'); // Το container του input για το incident_id

        if (selectedValue === 'personal') {
            personalInputContainer.show();
            personalInputContainer.append($('<label>', {for: "username",text: 'Username:'}));
            personalInputContainer.append($('<input>', {type:"text", name: "username",id: 'Username', placeholder:'nick'}));
            $('#Username').attr('required', 'required');
        } else {
            personalInputContainer.hide();
            $('#Username').removeAttr('required');
        }
    });
}

// --------------------------------------------------------------
function loggedInUser(){
    window.location.href = "adminGeneralPage.html";
}
function loginPOST() {
    const errCredentials = document.getElementById("error-login");
    var data = $('#myForm1').serialize();
    // console.log(data);
    var params = new URLSearchParams(data);
    if (params.get("username") !== "admin") {
        console.log("You are not admin!");
        return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            errCredentials.style.display = 'none';
            loggedInUser();
        } else if (xhr.status !== 200) {
            errCredentials.style.display = 'inline';
        }
    };
    xhr.open('POST', 'Login');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(data);
    return false;
}

$(document).ready(function () {
    // isLoggedIn();
    var currentPage = window.location.pathname.split('/').pop(); // Παίρνει το όνομα του αρχείου
    if (currentPage === 'LoginAdmin.html') {
        isLoggedIn();
    }
});
function isLoggedIn() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            loggedInUser();
        } else if (xhr.status !== 200) {
            console.log('No session');
        }
    };
    xhr.open('GET', 'Login');
    xhr.send();
}



function SubmitIncident() {


    var FormData = {
        incident_type : document.getElementById("incident_type").value,
        description : document.getElementById("description").value,
        user_phone : document.getElementById("user_phone").value,
        user_type : "admin",
        address : document.getElementById("address").value,
        municipality : document.getElementById("municipality").value,
        prefecture : document.getElementById("prefecture").value,
        status : document.getElementById("status").value,
    }
    var JsonOutput= JSON.stringify(FormData);
    var jsonparse;
    jsonparse = JSON.parse(JsonOutput);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("The incident was submitted successfully.");
            /* here we will put a buffer that will refresh the page after the messsage
             for the tables to be updated and the form will dissappear
             */
            window.location.reload();

        }else{
            alert(xhr.responseText);
        }
    };

    xhr.open('POST', 'NewIncident');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JsonOutput);
}

document.addEventListener('DOMContentLoaded', function() {
    RunningIncidents(); // Call the function once the page content is loaded
});

// login scripts
showPassword.addEventListener('click', function () {
    const passwordField1 = document.getElementById("password1");

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash", !this.classList.contains("fa-eye"));
    const type = passwordField1.getAttribute("type") === "password";
    passwordField1.setAttribute("type", type ? "text" : "password");
});

// bar chart
async function ShowStatistics(){
    HideDisplays();
    $('#IncStats').css('display','inline-block');
    $('#IncStats').css('align-items', 'center');
   await statisticsType();
   await statistics('users');
   await statistics('volunteers');
}
async function statistics(param){
    return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            $('#IncStats').append(`<div><h1 style="color: white;">Type of ${param}:</h1>`);
            createPieGraphics(responseData, param);
            $('#IncStats').append(`</div><br>`);
            resolve(responseData);
        } else if (xhr.status !== 200) {
            $('#ajaxContent').html('Request failed. Returned status of ' + xhr.status + "<br>");
            reject(new Error("Something went wrong!"));
        }
    };
    xhr.open('GET', `GetStatistics?type=${param}`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
    });
}
async function statisticsType(){
    return new Promise((resolve, reject) => {
    // $('#ajaxContent').append("<div id='piechart_3d'></div>");
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            $('#IncStats').append(`<div><h1 style="color: white;">Type of Incidents:</h1>`);
            createBarGraphics(responseData);
            $('#IncStats').append(`</div><br>`);

            resolve(responseData);
        } else if (xhr.status !== 200) {
            $('#IncStats').html('Request failed. Returned status of ' + xhr.status + "<br>");
            reject(new Error("Something went wrong!"));
        }
    };
    xhr.open('GET', 'IncidentsStats');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
    });
}
function createBarGraphics(jsonData) {
    // console.log(jsonData);

    google.charts.load("current", {packages: ['corechart', 'bar']});
    const labels = new Array();
    const values = new Array();
    for (const x in jsonData) {
        labels.push(x);
        values.push(parseInt(jsonData[x]));
    }
    google.charts.setOnLoadCallback(function () {
        drawBarChart(labels, values);
    });
}

function drawBarChart(column1,column2) {
    var dataVis = new google.visualization.DataTable();
    dataVis.addColumn('string', 'category');
    dataVis.addColumn('number', 'value');
    for (let i = 0; i < column1.length; i++) {
        dataVis.addRow([column1[i], column2[i]]);
    }
    var options = {
        title: 'Incident Number',
        'width': 500, 'height': 200,
        hAxis: {
            title: 'Number',
            minValue: 0,
            textStyle: {
                bold: true,
                fontSize: 12,
                color: '#000000'
            },
            titleTextStyle: {
                bold: true,
                fontSize: 18,
                color: '#000000'
            }
        },
        vAxis: {
            title: 'Incident',
            textStyle: {
                fontSize: 12,
                bold: false,
                color: '#000000'
            },
            titleTextStyle: {
                fontSize: 18,
                bold: true,
                color: '#000000'
            }
        },
        isStacked: 'true',
        bar: {groupWidth: '35%'}
    };

    $('#IncStats').append("<div id='piechart_3d'></div>");
    const container = document.getElementById('piechart_3d');

    var chart = new google.visualization.BarChart(container);
    chart.draw(dataVis, options);
}

function createPieGraphics(jsonData, param) {
    // console.log(jsonData);
    google.charts.load("current", {packages: ["corechart"]});
    const labels = new Array();
    const values = new Array();
    for (const x in jsonData) {
        labels.push(x);
        values.push(parseInt(jsonData[x]));
    }

    google.charts.setOnLoadCallback(function () {
        drawPieChart(labels, values, param);
    });
}


function drawPieChart(column1, column2, id) {
    var dataVis = new google.visualization.DataTable();
    dataVis.addColumn('string', 'category');
    dataVis.addColumn('number', 'value');
    for (let i = 0; i < column1.length; i++) {
        dataVis.addRow([column1[i], column2[i]]);
    }

    var options = {
        title: 'Users',
        'height': 200,
        is3D: true,
    };

    $('#IncStats').append(`<div id='${id}'></div>`);
    const container = document.getElementById(`${id}`);
    var chart = new google.visualization.PieChart(container);
    chart.draw(dataVis, options);
}