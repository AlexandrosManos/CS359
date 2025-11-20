var userName = "-1";
var UserType="";
var coordinates =[];
var mapInc ;

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
 * @param data
 * @returns {string}
 */
function createTableFromJSON(data) {
    const fieldsToShow = ["address", "description", "municipality"];
    let html = "<div class='table-container'>";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";

    for (const key of fieldsToShow) {
        if (key in data) {
            var category = key;
            var value = data[key];
            html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
        }
    }

    // html += "</table></div><br>";
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(data.description || 'No description available')}`;
    html += `</table>
<div class="fb-share-button" data-href="http://localhost:8080/Project_HY359_war_exploded/GeneralPage.html" data-layout="" data-size=""><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Flocalhost%3A8080%2FProject_HY359_war_exploded%2FGeneralPage.html&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Κοινοποίηση</a></div>
</div>
<br>`;

    return html;
}


function VolunteersRunningIncidents(id,data, msg) {
    const fieldsToShow = ["address", "description", "municipality", "vehicles", "firemen"];
    let html = "<div class='table-container' id='" + id + "'>";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";
    let mode = (msg === "Request To Participate") ? "" : "disabled";
    for (const key of fieldsToShow) {
        if (key in data) {
            var category = key;
            var value = data[key];
            html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
        }
    }
    html += `
        </table>
<div class="fb-share-button" data-href="http://localhost:8080/Project_HY359_war_exploded/GeneralPage.html" data-layout="" data-size=""><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Flocalhost%3A8080%2FProject_HY359_war_exploded%2FGeneralPage.html&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Κοινοποίηση</a></div>
        <button class="edit-button" ${mode} onclick="Participate(this)">${msg}</button>
    </div>
    <br>`;

    return html;
}
function Participate(button){
    const table = button.previousElementSibling;
    const rows = table.querySelectorAll('tr');
    let changes = [];
    // get the id
    const id = button.closest(".table-container").id;
    var data = {
        incident_id: id};
    // In case we want to add more data
    const serializedData = Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            button.textContent = "requested";
            button.disabled = true;
        } else if (xhr.status !== 200) {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };
    xhr.open('POST', "RequestToParticipate");
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(serializedData);
}

function createCatalogueFromJSON(data) {
    const fieldsToShow = [
        "incident_id", "incident_type", "description", "user_phone", "user_type",
        "address", "lat", "lon", "municipality", "prefecture",
        "start_datetime", "end_datetime", "danger", "status", "vehicles", "firemen"
    ];

    var id = document.getElementById("isc");
    let html = "<div class='incident-container'>" + "id='" + id + "'";
    html += "<table><tr><th>Category</th><th>Value</th></tr>";

    for (const key of fieldsToShow) {
        if (key in data) {
            var category = key;
            var value = data[key];
            html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
        }
    }
    html += `</table></div><br>`;

    return html;
}

function SearchIncident(){
    var FormData = {

        municipality: document.getElementById("municipality").value.trim(),
        incident_type: document.getElementById("incident_type").value.trim(),
        start_datetime: document.getElementById("start_datetime").value,
        end_datetime: document.getElementById("end_datetime").value,
        firefightersCount: document.getElementById("firefightersCount").value,
        vehiclesCount: document.getElementById("vehiclesCount").value,

    }
    var jsonparse = JSON.stringify(FormData);
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            console.log("we found the incident  ! ");
            const data = JSON.parse(xhr.responseText);

            createCatalogueFromJSON(data);

        }else if(xhr.status === 403){
            alert("No incident found for these criteria");
        }else{
            alert(xhr.responseText);
        }
    };

    xhr.open('POST', 'SearchIncidentServlet');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(jsonparse);
}
async function FindType(){
    return new Promise((resolve, reject) => {
        let url = 'FindTypeServlet';
        var xhr = new XMLHttpRequest();
        xhr.onload = function(){
            if(xhr.readyState === 4 && xhr.status=== 200) {
                const data =  JSON.parse(xhr.responseText);
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

// Rest of the code...
if(sessionStorage.getItem("clicked") ==="0"){
    sessionStorage.setItem("LastDate","-1");
}

function IncidentsNearMe() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const obj = JSON.parse(xhr.responseText);

            if (obj.length === 0) {
                console.log("No incident near");
            } else {
                var dateObjectsArray = []; // Create an array for the dates

                // Extract start_datetime values and convert them to Date objects
                obj.forEach(incident => {
                    if (incident.start_datetime) {
                        dateObjectsArray.push(new Date(incident.start_datetime));
                    }
                });

                // Sort the array in descending order (latest date first)
                dateObjectsArray.sort((a, b) => b - a);

                // Get the latest date from the sorted array
                const latestDate = dateObjectsArray[0];
                let c = document.getElementById("not");

                // Retrieve LastDate from sessionStorage and convert it to a Date object
                const storedLastDate = sessionStorage.getItem("LastDate");
                const lastDate = storedLastDate === "-1" ? null : new Date(storedLastDate);


                // Compare the latest date with the last stored date
                if (!lastDate || latestDate > lastDate) {
                    if (c) {
                        c.style.color = "red"; // Change the color to red
                    }
                    PlayNotificationSound();
                    // Update LastDate in sessionStorage
                    sessionStorage.setItem("LastDate", latestDate.toISOString());
                    console.log("Updated LastDate:", sessionStorage.getItem("LastDate"));
                    sessionStorage.setItem("clicked", "0");
                } else if (latestDate.toISOString() === sessionStorage.getItem("LastDate") && sessionStorage.getItem("clicked") === "1") {
                    if (c) {
                        c.style.color = "white"; // Revert color to white
                    }
                }
            }

        } else {
            alert("Request failed. Returned status of " + xhr.status);
        }
    };

    // Open the GET request to fetch incident data
    xhr.open("GET", "NotificationServlet", true);
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
function AllIncidents() {
    let url = 'RunningIncidents';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Log parsed data
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);

            mapInc = initMap();

            obj.forEach((incident) => {
                if (incident.lat && incident.lon) {
                    addMarkerToMap(mapInc, incident.lat, incident.lon, incident.description);
                }
            });

            const container = document.getElementById("incident-container");

            for(let id in obj){
                const data = obj[id]; // Παίρνουμε το αντικείμενο δεδομένων
                // document.getElementById("msg").innerHTML += createTableFromJSON(data);
                if (UserType !== 'volunteer')
                    container.innerHTML += createTableFromJSON(data);
                else
                {
                    if (data.message) {
                        container.innerHTML += VolunteersRunningIncidents(data.incident_id,data,data.message);
                    }else
                        container.innerHTML += VolunteersRunningIncidents(data.incident_id,data,"Request To participate");

                }

            }
            container.innerHTML += `<button class="edit-button" id="showMap" onClick="OpenMapModal()">Show Map Incident</button>`;
        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };
    if (UserType === 'volunteer')
        url += `?param=${encodeURIComponent(userName)}`;

    // Open the GET request to fetch incident data
    xhr.open('GET', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function OpenMapModal(){
        const closeMapBtn = document.getElementById('closeMapBtn');
        const mapModal = document.getElementById('mapModal');
        mapModal.style.display = 'block';

        closeMapBtn.addEventListener('click', () => {
            mapModal.style.display = 'none';

        });

}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Wait for FindType to complete
        await FindType();
        AllIncidents();
    } catch (error) {
        console.error("An error occurred during FindType:", error);
    }
});

var UserType = ""; // Initialize as an empty string


(async function main() {
    try {
        await FindType(); // Wait for the user type to be retrieved

        if (UserType === "user") { // Compare using ===
            setInterval(IncidentsNearMe, 5000); // Call the function every 5 seconds
        } else if (UserType === "volunteer") { // Compare using ===
            document.getElementById("participation").style.display = 'inline';
            document.getElementById("MyHistory").style.display = 'inline';
            setInterval(IncidentsNearMe, 5000); // Call the function every 5 seconds
        }
        else {
            console.log("UserType is not 'user'. No interval started.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();

function stopAllSounds() {
    var allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0; // Reset playback to start
    });
}

function PlaySubmitSound(){
    stopAllSounds();
    var winSound = document.getElementById("SubmitAudio");
    winSound.play();
    winSound.volume = 0.6;

    winSound.play().catch(err => console.error("Audio playback error:", err));
}

function PlayNotificationSound(){
    stopAllSounds();
    var winSound = document.getElementById("NotificationAudio");
    winSound.play();
    winSound.volume = 0.6;

    winSound.play().catch(err => console.error("Audio playback error:", err));
}

async function SubmitIncident() {

    var FormData = {
        incident_type : document.getElementById("incident_type").value,
        description : document.getElementById("description").value,
        user_phone : document.getElementById("user_phone").value,
        user_type : UserType,
        address : document.getElementById("address").value,
        municipality : document.getElementById("municipality").value,
        prefecture : document.getElementById("prefecture").value,
        status : "submitted",

    }

    var JsonOutput= JSON.stringify(FormData);
    var jsonparse;
    jsonparse = JSON.parse(JsonOutput);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            alert("The incident was submitted successfully.");
            PlaySubmitSound();
            /* here we will put a buffer that will refresh the page after the messsage
             for the tables to be updated and the form will dissappear
             */
        }else{
            alert(xhr.responseText);
        }
    };

    xhr.open('POST', 'NewIncident');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JsonOutput);
}

function RegPage(){
    window.open("Register.html","_self");
}

function LogPage(){
    window.open("index.html","_self");
}

// For Map
function initMap(){
    const map = new OpenLayers.Map("Map");
    const mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
    const position = new OpenLayers.LonLat(25.1442, 35.3387).transform(fromProjection, toProjection);
    const zoom = 10;

    if (coordinates.length > 0)
        addMarkerToMap(map, coordinates[0].lat, coordinates[0].lon, "your position");

    map.setCenter(position, zoom);
    return map;

}

function addMarkerToMap(map, lat, lon, description) {
    // console.log(`Add marker for lat = ${lat} and lon = ${lon}`);
    function setPosition(lat, lon) {
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position = new OpenLayers.LonLat(lon, lat).transform(fromProjection, toProjection);
        return position;
    }
    const position = setPosition(lat, lon);

    const markersLayer = map.getLayersByName("Markers")[0] || new OpenLayers.Layer.Markers("Markers");
    if (!map.getLayersByName("Markers").length) {
        map.addLayer(markersLayer);
    }

    const marker = new OpenLayers.Marker(position);

    marker.events.register('mousedown', marker, function () {
        alert("Incident: " + description);
    });

    markersLayer.addMarker(marker);
}



