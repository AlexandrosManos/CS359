// password field
const showPassword = document.getElementById("ShowPassword");
const passwordField = document.getElementById("password");
// confirm password field
const showConfPassword = document.getElementById("ShowConfirmPass");
const ConfpassField = document.getElementById("con_password");
//error message if the confrim password and the password value is not the same
const errorMessage = document.getElementById("error-message");
const strengthMessage = document.getElementById("strength-message");
const locationVerify = document.getElementById("Verify-location");
const MapMessage = document.getElementById("Map-error");

const userType = document.getElementById("type");

// An array that contains the forbidden Sequences
const forbSeq = ['fire', 'fotia', 'ethelontis', 'volunteer'];
const volunteerFields = document.getElementById("volunteerFields");
const birthdateInput = document.getElementById("birthdate");

// For the output
const jsonOutput = document.getElementById("jsonOutput");
const form = document.getElementById("myForm");

var lat;
var lon;
let map;

var verifiedLocation = false;
var PasswordStatus = "";

// Show-Hide password button (icon)
showPassword.addEventListener('click', function () {
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash", !this.classList.contains("fa-eye"));
    const type = passwordField.getAttribute("type") === "password";
    passwordField.setAttribute("type", type ? "text" : "password");
});

// Show-Hide confirm password button (icon)
showConfPassword.addEventListener('click', function () {
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash", !this.classList.contains("fa-eye"));
    const type2 = ConfpassField.getAttribute("type") === "password";
    ConfpassField.setAttribute("type", type2 ? "text" : "password");
});

// The password and the confirm password must be the same
function verifyPassword() {
    if (passwordField.value !== ConfpassField.value) {
        errorMessage.style.display = 'inline';
        return false;
    }
    errorMessage.style.display = 'none';
    return true;

}

// Check the strength of the password
function checkPasswordStrength(password) {
    // Convert the password to lower case
    const lowerCasePassword = password.toLowerCase();
    for (const seq of forbSeq) {
        if (lowerCasePassword.includes(seq)) {
            return "forbidden";
        }
    }

    // remove all non-numeric characters
    // \D => ^\d
    const numbers = password.replace(/\D/g, "").length;
    if (numbers >= password.length / 2) {
        return "Weak";
    }

    // key = char, value = count
    const charCount = {};
    for (let i = 0; i < password.length; i++) {
        charCount[password[i]] = (charCount[password[i]] || 0) + 1;
    }
    // give max function rest parameters
    const maxCharCount = Math.max(...Object.values(charCount));
    if (maxCharCount >= password.length / 2) {
        return "Weak";
    }

    // Contains one symbol, one number, one upper and one lower case letter
    const strong = /\d/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[\W_]/.test(password);
    if (strong) {
        return "Strong";
    }

    return "Medium";
}

// Display message about password strength
passwordField.addEventListener('input', () => {
    PasswordStatus = checkPasswordStrength(passwordField.value);
    strengthMessage.style.display = 'inline';
    if (PasswordStatus === "forbidden") {
        strengthMessage.style.color = 'red';
        strengthMessage.textContent = 'Password contains forbidden Sequences';
    } else if (PasswordStatus === "Weak") {
        strengthMessage.style.color = 'tomato';
        strengthMessage.textContent = 'Weak Passowrd';
    } else if (PasswordStatus === "Medium") {
        strengthMessage.style.color = 'orange';
        strengthMessage.textContent = 'Medium Passowrd';
    } else {
        strengthMessage.style.color = 'green';
        strengthMessage.textContent = 'Strong Passowrd';
    }
});

// If the user type is volunteer, change the extras field to be required.
function RequiredFields(state) {
    document.getElementById("volunteer_type").required = state;
    document.getElementById("height").required = state;
    document.getElementById("weight").required = state;
}

userType.addEventListener("change", function () {
    const termsMessage = document.getElementById("termsMessage");
    if (this.value === "volunteer") {
        // Display extra fields  
        volunteerFields.style.display = "block";
        // Set the required attributes to be true
        RequiredFields(true);
        termsMessage.textContent = "Δηλώνω υπεύθυνα ότι ανήκω στο ενεργό δυναμικό των εθελοντών πυροσβεστών.";
    } else {
        // Remove the extra fields  
        volunteerFields.style.display = "none";
        // Set the required attributes to be false
        RequiredFields(false);
        termsMessage.textContent = "Απαγορεύεται η άσκοπη χρήση της εφαρμογής. Συμφωνώ πως η άσκοπη χρήση της θα διώκεται ποινικά.";
    }
});

function ageCheck() {
    if (userType.value !== "volunteer") {
        // We do not care
        return true;
    }
    let birthdateValue = new Date(birthdateInput.value);
    let today = new Date();
    let age = today.getFullYear() - birthdateValue.getFullYear();
    if (today.getMonth() < birthdateValue.getMonth()) {
        age -= 1;
    }

    // We could also check about the day of the month
    if (age < 18 || age > 55) {
        return false;
    }
    return true;
}

// Verify the location
function loadDoc() {
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    var addressName = document.getElementById("address").value;
    const municipality = document.getElementById("prefecture").value;
    var country = document.getElementById("country").value;
    var address = addressName + " " + municipality + " " + country;

    xhr.addEventListener("readystatechange", function () {

        try {
            if (this.readyState === this.DONE) {
                locationVerify.style.display = "inline";

                const obj = JSON.parse(xhr.responseText);
                // non empty list
                if (obj && obj.length > 0) {
                    const location = obj[0];
                    const displayName = location.display_name;
                    lat = location.lat;
                    lon = location.lon;
                    verifiedLocation = true;
                    if (!addressName || !country) {
                        locationVerify.style.color = 'red';
                        locationVerify.innerHTML = "Please add all your region details before verifying.";
                        verifiedLocation = false;

                    } else if (displayName.toLowerCase().includes("crete")) {
                        locationVerify.style.color = 'green';
                        locationVerify.innerHTML = "Location verified";
                        MapMessage.style.display = 'none';
                    }
                    else {
                        locationVerify.style.color = 'orange';
                        locationVerify.innerHTML = "Location verified, but the service is available only for Crete at the moment.";
                        MapMessage.style.display = 'none';
                    }
                } else {
                    locationVerify.style.color = 'red';
                    locationVerify.innerHTML = "Unable to verify location.";
                    verifiedLocation = false;
                }
            }

        } catch (error) {
            console.error(error);
        }
    });
    xhr.open("GET", "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" + address + "&acceptlanguage=en&polygon_threshold=0.0");

    xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');
    var key = "YOUR-API-KEY";
    xhr.setRequestHeader("x-rapidapi-key", key);

    xhr.send(data);
}



function showMap() {
    // Delete the previous map and hide the "Verify-location" message
    clearMap();
    // if the location is not verified,  return
    if (!verifiedLocation) {
        MapMessage.style.display = 'block';
        return;
    } else {
        MapMessage.style.display = 'none';
    }


    document.getElementById("Map").style.display = 'block';

    map = new OpenLayers.Map("Map");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);

    function setPosition(lat, lon) {
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position = new OpenLayers.LonLat(lon, lat).transform(fromProjection, toProjection);
        return position;
    }

    //Markers	
    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);

    //Only one Marker	
    var position = setPosition(lat, lon);
    var mar = new OpenLayers.Marker(position);
    markers.addMarker(mar);

    //Center and zoom settings
    const zoom = 10;
    map.setCenter(position, zoom);

}

// for any any action on those fields, need a new verification
document.getElementById("address").addEventListener("input", () => {
    clearMap();
    verifiedLocation = false;
});
document.getElementById("prefecture").addEventListener("input", () => {
    clearMap();
    verifiedLocation = false;
});
document.getElementById("country").addEventListener("input", () => {
    clearMap();
    verifiedLocation = false;
});

// Destroy the previous map, if there is one
function clearMap() {
    document.getElementById("Map").style.display = 'none';
    if (verifiedLocation) {
        locationVerify.style.display = "none";
    }
    if (map) {
        map.destroy();
        map = null;
    }
}

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!verifyPassword() || PasswordStatus !== "Medium" && PasswordStatus !== "Strong") {
        event.preventDefault();
        return;
    } else if (!ageCheck()) {
        alert("You do not meet age requirements");
        event.preventDefault();
        return;
    }

    alert("Sub");
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        // add to dict
        formObject[key] = value;
    });
    const jsonString = JSON.stringify(formObject, null, 2);
    jsonOutput.textContent = "JSON Output:\n" + jsonString;
    jsonOutput.style.display = "block";

});

