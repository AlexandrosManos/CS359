var UserType="";
var userName = -1;
var coordinates =[];
var GNumber;

sessionStorage.setItem("clicked","1");


async function FindType(){
    return new Promise((resolve, reject) => {
        let url = 'FindTypeServlet';
        var xhr = new XMLHttpRequest();
        xhr.onload = function(){
            if(xhr.readyState === 4 && xhr.status=== 200) {
                const data =  JSON.parse(xhr.responseText);
                // console.log(data);
                if (data.userType) {
                    UserType = data.userType;
                }
                if (data.userName) {
                    userName = data.userName;
                }
                if (data.lat && data.lon) {
                    coordinates.push({ lat: data.lat, lon: data.lon });
                }
                resolve();
            }else{
                alert(JSON.parse(xhr.responseText));
                reject("Failed to fetch user type: " + xhr.status);
            }
        }
        xhr.open('GET', url);
        xhr.setRequestHeader('Content-type','application/json');
        xhr.send();
    });
}


/**
 * This function is used to create a dynamic table for the data
 * after a successfull AJAX request.
 * @param data
 * @param param
 * @returns {string}
 */
function createTableFromJSON(data, param = null) {
    const fieldsToShow = ["address", "description", "municipality"];
    var html = "<div class='table-container'>";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";
    for (const key of fieldsToShow) {
        if (key in data) {
            var category = key;
            var value = data[key];
            html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
        }
    }
    html += `
        </table>
       <button class="Message-button" id="button" data-incident-id="${data.incident_id}"  onclick="CreateCatalogueMessages(${data.incident_id},${param})">Open chat</button>
    </div><br>`;

    return html;
}

function createCatalogueFromJSON(data, fields = null) {
    let fieldsToShow = ["address", "description", "municipality"];
    if (fields != null)
        fieldsToShow = fields;

    var html = "<div class='table-container'>";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";

    for (const key of fieldsToShow) {
        if (key in data) {
            var category = key;
            var value = data[key];
            html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
        }
    }

    html += "</table></div><br>";
    return html;
}




function SetLastPressedButton(number){
   GNumber = number;

}

function GetLastPressedButton() {
    return GNumber;
}

var LastDate = "";
function TakeLastDate(incident_id) {
    var FormData = {
        ["incident_id"] : incident_id
    };

    const serializedData = Object.keys(FormData)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(FormData[key])}`)
        .join('&');
    // console.log("TakeLastDate "+serializedData);

    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.readyState === 4 && xhr.status === 200) {
            LastDate = xhr.responseText;
            // console.log(LastDate);
        }else{
            alert(xhr.responseText);
        }
    }

    xhr.open('POST', 'LastDateServlet');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(serializedData);

}

function CreateCatalogueMessages(incident_id, param = null) {
    let url = 'MessageCatalogueServlet';
    var FormData = {
        ["incident_id"] : incident_id
    };

    const serializedData = Object.keys(FormData)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(FormData[key])}`)
        .join('&');
    // console.log("CreateCatalogueMessages "+serializedData);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            const responseData = JSON.parse(xhr.responseText);
            const Container = document.getElementById("msg-cont");
            Container.innerHTML = "";
            const incidentContainers = GroupByIncidentIdAndSecondary(responseData, 'recipient');

            incidentContainers.forEach(({ id, container }) => {
                // Filter messages that belong to the current incident_id
                responseData.filter(message => `${message.incident_id}-${message.recipient}` === id)
                    .forEach(message => {
                        URLch = "UpdateMessage";
                        idName = "message_id";
                        const tableHtml = `<p>[${message.date_time}] ${message.sender}:  ${message.message} </p>`;
                        container.innerHTML += tableHtml;
                    });
                Container.appendChild(container);
                const [incident_id, recipient] = id.split('-');

                const inputField = document.createElement("input");
                inputField.id = "message";
                inputField.type = "text";
                inputField.placeholder = "Type your message here...";
                inputField.className = "message-input";
                inputField.style.marginRight = "10px";

                const sendButton = document.createElement("button");
                sendButton.className = "edit-button";
                sendButton.textContent = "Send a message";
                sendButton.onclick = function () {
                    SendMessage(incident_id, recipient);
                };
                container.appendChild(inputField);
                container.appendChild(sendButton);
            });
            if (responseData.length === 0){
                showModal(incident_id, param == null);

            }

        }else{
            alert("Message was not send!, error status:" + xhr.status);
        }

    }
    if (param != null) {
        url += `?param=${encodeURIComponent(userName)}`;
    }

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(serializedData);

}
function GroupByIncidentIdAndSecondary(data, param = null) {
    // Group the data based incident_id and recipient secondary key -> param
    const groupedBy = data.reduce((group, comp) => {
        // Key combining incident_id and param
        const key = param ? `${comp.incident_id}-${comp[param] || "undefined"}` : `${comp.incident_id}`;
        if (!group[key]) {
            group[key] = [];
        }
        group[key].push(comp);
        return group;
    }, {});
    //An array to store containers each combination
    const containers = [];

    for (const key in groupedBy) {
        // Split incident_id and param
        const [incidentId, type] = key.split('-');
        if (UserType == "user" && type != "public" )
            continue;

        const cont = document.createElement("div");
        cont.classList.add("incident-container");
        cont.id = `incident-${key}`;

        const head = document.createElement("h2");
        head.textContent = param ? `Incident ID: ${incidentId} - ${param}: ${type}` : `Incident ID: ${incidentId}`;
        cont.appendChild(head);

        containers.push({ id: key, container: cont });
    }
    return containers;
}
function SendMessage(incident_id = null, recipient = null) {
    // console.log("Fetching username...");
    if (incident_id == null && recipient == null)
    {
        incident_id = $('#incident_id').val();
        recipient = $('#recipient').val();
    }

    // Get username asynchronously and pass it to sendMessageLogic
    getUserData(function(sender) {
        // console.log("name: " + sender);

        // Extract incident_id (assuming it's stored via GetLastPressedButton)
        // console.log("I_ID: " + incident_id);

        // Prepare the form data for the message
        var formData = {
            incident_id: incident_id,
            message: $('#message').val(),
            sender: sender,  // Use the retrieved username as sender
            recipient: recipient
        };

        var data = JSON.stringify(formData);
        // console.log(data);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Create the dynamic form for the incident messages
                if (recipient != "admin")
                    CreateCatalogueMessages(incident_id);
                else
                    adminChatLog();
            } else if (xhr.status !== 200) {
                alert("Message was not sent! Error status: " + xhr.status);
            }
            CloseModal();
        };

        xhr.open('POST', 'NewMessage');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(data);
    });
}

function showModal(incident_id, mode) {
    $("#UserModal").load("SendMessageModal.html", function() {
        // Add the hidden fields for incident data
        var input = $(`<input type="number" id="incident_id" value="${incident_id}" name="incident_id" style="display: none">`);
        $('#MessageForm').prepend(input);

        const formElement = document.getElementById("MessageForm");
        const newParagraph = document.createElement("p");
        newParagraph.textContent = `Create a message!`;
        newParagraph.className = "New-message";
        formElement.insertBefore(newParagraph, formElement.firstChild);


        $('#recipient').append($('<option>', {value: "admin",text: 'Admin'}));
        $('option[value="public"]').prop("disabled", !mode);
        $('option[value="volunteers"]').prop("disabled", mode);
        $('option[value="admin"]').prop("disabled", mode);

        SetLastPressedButton(incident_id);
    });

}
function CloseModal(){
    $("#UserModal").empty();
}


function getUserData(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            // console.log(responseData.username);
            // Pass the username to the callback function
            callback(responseData.username);
        } else if (xhr.status !== 200) {
            console.log("Request failed. Status: " + xhr.status);
        }
    };

    xhr.open('GET', 'Login');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}


/**

 This function runs within the loading of this Page
 It sends a Ajax Request to get the incidents
 with status = running
 It will return the incident_type , description,Address and date
 It will than Create a table dynamically
 @constructor**/

async function IncidentsNearMe(incIds = null) {
    return new Promise(async (resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {

                // Log parsed data
                const obj = JSON.parse(xhr.responseText);

                if(obj.length === 0) {
                    alert("Κανένα Περιστατικό δεν βρέθηκε κοντά");
                }
                const container = document.getElementById("incident-container");

                let IncidentIDs=[];
                for(let id in obj){
                    const data = obj[id];

                    if(data.incident_id){
                        if (incIds != null &&  incIds.includes(data.incident_id))
                            IncidentIDs.push(data.incident_id);
                    }

                    container.innerHTML += createTableFromJSON(data);
                }
                // Here you will take the array as a parameter and call the Last Date for each IncidentID
                IncidentIDs.forEach(incidentID => {
                    TakeLastDate(incidentID);
                });
                resolve();

            } else {
                reject("Error parsing JSON: " + xhr.status);

                alert('Request failed. Returned status of ' + xhr.status);
            }
        };

        // Open the GET request to fetch incident data
        xhr.open('GET', 'NotificationServlet', true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send();
    });

}
async function ExtractLatLon() {
    return new Promise(async (resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                // Log parsed data
                const obj = JSON.parse(xhr.responseText);

                if(obj.length === 0) {
                    alert("Κανένα Περιστατικό δεν βρέθηκε κοντά");
                    resolve([]);
                    return;

                }
                const filteredData = obj.map(item => ({
                    incident_id: item.incident_id,
                    lat: item.lat,
                    lon: item.lon
                }));
                resolve(filteredData);
            } catch (error) {
                reject("Error parsing JSON: " + error.message);
            }
        } else {
            reject('Request failed - status of ' + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open('GET', 'RunningIncidents', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
    });
}

function AllIncidents(param = null) {
    let url = 'RunningIncidents';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            const container = document.getElementById("incident-container");

            for(let id in obj){
                const data = obj[id];
                container.innerHTML += createTableFromJSON(data,param);
            }

        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };
    if (param != null)
        url += `?param=MyRunningIncidents`;

    // Open the GET request to fetch incident data
    xhr.open('GET', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
async function Distances(filteredData) {
    return new Promise(async (resolve, reject) => {
        const Key = 'b56dfa5a0cmsh3ec4a774dabe721p1ccdfejsnc1ea3a886cdb';

        const origins = coordinates.map(coord => `${coord.lat},${coord.lon}`).join(';');
        const destinations = filteredData
            .map(row => `${row.lat},${row.lon}`)
            .join(';');

        const url = `https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=${origins}&destinations=${destinations}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': Key,
                    'x-rapidapi-host': 'trueway-matrix.p.rapidapi.com',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }
            const responseData = await response.json();
            const incidentIds = filterIncidents(responseData.distances, filteredData);
            resolve(incidentIds);

        } catch (error) {
            console.error("Error in distances");
            reject(error);
        }
    });
}


function filterIncidents(distances, filteredData) {
    const maxDistance = 30000;
    const incidentIds = [];

    distances[0].forEach((distance, index) => {
        if (distance < maxDistance) {
            incidentIds.push(filteredData[index].incident_id);
        }
    });

    return incidentIds;
}

document.addEventListener('DOMContentLoaded', async function() {

    // here we will also add the All incidents function
    const currentPage = window.location.pathname;
    // console.log(currentPage);

    // Call the function once the page content is loaded
    await FindType();

    if(currentPage.endsWith("Notifications.html")){
        let filteredData = await ExtractLatLon();
        let incIds =  await Distances(filteredData);

        // console.log("Filtered Data:", filteredData);
        // console.log("incIds:", incIds);

        IncidentsNearMe(incIds); // Call the function once the page content is loaded


    }else if(currentPage.endsWith("Messages.html")){

        AllIncidents();

    }else if(currentPage.endsWith("ParticipationPage.html")){

        AllIncidents("Participation");

    }else if(currentPage.endsWith("HistoryPage.html")){

        AllMyParticipations();

    }

});
function AllMyParticipations() {
    let url = 'AllMyParticipations';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            const container = document.getElementById("incident-container");
            container.innerHTML = '';
            const fields= ["incident_type","description", "address", "municipality","status", "success", "comment"];

            if (obj && Object.keys(obj).length > 0) {
                container.innerHTML += createCatalogueFromJSON(obj, fields);
            } else {
                container.innerHTML = "Δεν υπάρχουν συμμετοχές.";
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

function adminChatLog(){

    let url = 'MessageCatalogueServlet';
    var FormData = {
        ["sender"] : userName,
        ["recipient"] : 'admin'
    };
    document.getElementById("message").value = '';
    const serializedData = Object.keys(FormData)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(FormData[key])}`)
        .join('&');
    // console.log("CreateCatalogueMessages "+serializedData);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            const responseData = JSON.parse(xhr.responseText);
            // console.log(JSON.stringify(responseData, null, 2));

            const Container = document.getElementById("chatLog");

            Container.innerHTML = "";

                // Filter messages that belong to the current incident_id
                responseData.forEach(message => {
                        URLch = "UpdateMessage";
                        idName = "message_id";
                        const tableHtml = `<p>[${message.date_time}] ${message.sender}:  ${message.message} </p>`;
                        Container.innerHTML += tableHtml;
            });

        }else{
            alert("Message was not send!, error status:" + xhr.status);
        }

    }

    xhr.open('GET', url);
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}
