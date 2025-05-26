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

var lat = "35.3377457";
var lon =  "25.1130694";
let map;

// var verifiedLocation = true;
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
    if (this.value === "volunteers") {
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
    if (userType.value !== "volunteers") {
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
    const latVar = document.getElementById("lat");
    const lonVar = document.getElementById("lon");
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
                    latVar.value = lat;
                    lonVar.value = lon;
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
                if ($('#general-error').text() === "Location is not verified, please verify your location")
                    $('#general-error').empty();

            }

        } catch (error) {
            console.error(error);
        }
    });
    xhr.open("GET", "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" + address + "&acceptlanguage=en&polygon_threshold=0.0");

    xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');
    var key = "b56dfa5a0cmsh3ec4a774dabe721p1ccdfejsnc1ea3a886cdb";
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

// for any action on those fields, need a new verification
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

function RegisterPOST() {
        let url = userType.value + 'Servlet';
        var genErr;
        $('#general-error').empty();
        if (!verifyPassword()){
            genErr = "Password and confirm password must be the same";
            alert(genErr);
            $('#general-error').append("<p style='color:red'>" + genErr + "</p>");
            return;
        } else if(PasswordStatus !== "Medium" && PasswordStatus !== "Strong") {
            genErr = "Add stronger Password";
            alert(genErr);
            $('#general-error').append("<p style='color:red'>" + genErr + "</p>");
            return;
        }else if(!verifiedLocation){
            genErr = "Location is not verified, please verify your location";
            alert(genErr);
            $('#general-error').append("<p style='color:red'>" + genErr + "</p>");
            return;
        } else if (!ageCheck()) {
            genErr = "You do not meet age requirements";
            alert(genErr);
            $('#general-error').append("<p style='color:red'>" + genErr + "</p>");
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let err = "";
            if (xhr.readyState === 4 && xhr.status === 200) {
                const responseData = JSON.parse(xhr.responseText);
                console.log("Response from server1:", xhr.responseText);
                $('#general-error').empty();
                showModal("Successful Registration");
            } else if (xhr.status !== 200) {
                alert('Request failed. Returned status of ' + xhr.status);
                const responseData = JSON.parse(xhr.responseText);
                for (const x in responseData) {
                    err += responseData[x];
                }
                $('#general-error').empty();
                $('#general-error').append("<p style='color:red'>" + err + "</p>")
            }
        };
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => (formObject[key] = value));
        const jsonString = JSON.stringify(formObject, null, 2);

        xhr.open('POST', url);
        xhr.setRequestHeader("Content-type", "application/json");
        // xhr.send(JSON.stringify(formObject));
        xhr.send(JSON.stringify(formObject));

        jsonOutput.textContent = "JSON Output:\n" + jsonString;
        jsonOutput.style.display = "block";
}

function CheckUserName(){
    const usernameField = document.getElementById('username');
    const usernameValue = usernameField.value;
    console.log(`Username: ${usernameValue}`);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let err = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Response from server:", xhr.responseText);
            $('#username-error').empty();
        } else if (xhr.status !== 200) {
            const responseData = JSON.parse(xhr.responseText);
            for (const x in responseData) {
                err += responseData[x];
            }
            $('#username-error').empty();
            $('#username-error').append("<p style='color:red' >" + err + "</p>")
        }
    };
    xhr.open('POST', 'UsernameCheck');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(usernameValue);

}
function CheckEmail(){
    const emailField = document.getElementById('email');
    const emailValue = emailField.value;
    console.log(`Email: ${emailValue}`);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let err = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Response from server:", xhr.responseText);
            $('#email-error').empty();
        } else if (xhr.status !== 200) {
            const responseData = JSON.parse(xhr.responseText);
            for (const x in responseData) {
                err += responseData[x];
            }
            $('#email-error').empty();
            $('#email-error').append("<p style='color:red' >" + err + "</p>")
        }
    };
    xhr.open('POST', 'EmailCheck');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(emailValue);

}
function CheckTelephone(){
    const telephoneField = document.getElementById('telephone');
    const telephoneValue = telephoneField.value;
    console.log(`Telephone: ${telephoneValue}`);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let err = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Response from server:", xhr.responseText);
            $('#telephone-error').empty();
        } else if (xhr.status !== 200) {
            const responseData = JSON.parse(xhr.responseText);
            for (const x in responseData) {
                err += responseData[x];
            }
            $('#telephone-error').empty();
            $('#telephone-error').append("<p style='color:red' >" + err + "</p>")
        }
    };
    xhr.open('POST', 'TelephoneCheck');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(telephoneValue);
}
function restFunc(){
    verifiedLocation = false;
    $('#telephone-error').empty();
    $('#email-error').empty();
    $('#username-error').empty();
    $('#general-error').empty();
    clearMap();


}
function showModal(message) {
    const OkButton = document.getElementById("OkBt");
    const messageModal = document.getElementById("modal-message");
    messageModal.textContent = message;
    document.getElementById("myModal").style.display = "block";
    OkButton.addEventListener("click",  () => {
        document.getElementById("myModal").style.display = "none";
        window.location.reload();
    });
}

