// password field
const showPassword = document.getElementById("ShowPassword");
const passwordField = document.getElementById("password");
// confirm password field
//error message if the confrim password and the password value is not the same
const strengthMessage = document.getElementById("strength-message");
const locationVerify = document.getElementById("Verify-location");
const Edit = document.getElementById("edit");

const ChangesBt = document.getElementById("Changes");
const LogoutCont = document.getElementById("Logout-container");

const userType = document.getElementById("type");

// An array that contains the forbidden Sequences
const forbSeq = ['fire', 'fotia', 'ethelontis', 'volunteer'];
const volunteerFields = document.getElementById("volunteerFields");
const birthdateInput = document.getElementById("birthdate");
const termsMessage = document.getElementById("termsMessage");
const LocationBt = document.getElementById("verify");

var lat = "35.3377457";
var lon = "25.1130694";
let map;

// var verifiedLocation = false;
var verifiedLocation = true;
var PasswordStatus = "Strong";
var validEmail = true;


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
function checkPassword() {
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
}

showPassword.addEventListener('click', function () {
    const passwordField1 = document.getElementById("password1");

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash", !this.classList.contains("fa-eye"));
    const type = passwordField1.getAttribute("type") === "password";
    passwordField1.setAttribute("type", type ? "text" : "password");
});

function SafeMode(flag) {
    document.getElementById("email").disabled = flag;
    document.getElementById("firstname").disabled = flag;
    document.getElementById("lastname").disabled = flag;
    document.getElementById("birthdate").disabled = flag;

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => radio.disabled = flag);

    userType.disabled = true;

    if (userType.value === "volunteers") {
        document.getElementById("volunteer_type").disabled = flag;
        document.getElementById("height").disabled = flag;
        document.getElementById("weight").disabled = flag;

    }
    document.getElementById("country").disabled = flag;
    document.getElementById("municipality").disabled = flag;
    document.getElementById("prefecture").disabled = flag;
    document.getElementById("address").disabled = flag;
    document.getElementById("job").disabled = flag;
    document.getElementById("terms").disabled = flag;

    passwordField.disabled = flag;

}

// Edit user's profile
Edit.addEventListener("click", () => {
    const mess = document.getElementById("Edit-message");
    SafeMode(false);
    if (mess.textContent == "Edit") {
        mess.textContent = "Editing";
        ChangesBt.style.display = 'inline-block';
        LogoutCont.style.display = 'none';
        LocationBt.style.display = 'none';
    }

});

// If the user type is volunteer, change the extras field to be required.
function RequiredFields(state) {
    document.getElementById("volunteer_type").required = state;
    document.getElementById("height").required = state;
    document.getElementById("weight").required = state;
}

document.getElementById("address").addEventListener("input", () => {
    LocationBt.style.display = 'inline-block';
    verifiedLocation = false;
});
document.getElementById("prefecture").addEventListener("input", () => {
    LocationBt.style.display = 'inline-block';
    verifiedLocation = false;
});
document.getElementById("country").addEventListener("input", () => {
    LocationBt.style.display = 'inline-block';
    verifiedLocation = false;
});
// Verify the location
function loadDoc() {
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    var addressName = document.getElementById("address").value;
    var municipality = document.getElementById("municipality").value;
    var country = document.getElementById("country").value;
    var address = addressName + " " + municipality + " " + country;
    console.log(address);
    const latVar = document.getElementById("lat");
    const lonVar = document.getElementById("lon");

    xhr.addEventListener("readystatechange", function () {

        try {
            if (this.readyState === this.DONE) {
                locationVerify.style.display = "inline";

                const obj = JSON.parse(xhr.responseText);
                // non-empty list
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
                    }
                    else {
                        locationVerify.style.color = 'orange';
                        locationVerify.innerHTML = "Location verified, but the service is available only for Crete at the moment.";
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

function CheckEmail() {
    const emailField = document.getElementById('email');
    const emailValue = emailField.value;
    const usernameField = document.getElementById('username');
    const usernameValue = usernameField.value;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let err = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            $('#email-error').empty();
            validEmail = true;
        } else if (xhr.status !== 200) {
            const responseData = JSON.parse(xhr.responseText);
            for (const x in responseData) {
                err += responseData[x];
            }
            $('#email-error').empty();
            $('#email-error').append("<p style='color:red' >" + err + "</p>")
            validEmail = false;
        }
    };
    const data = `email=${encodeURIComponent(emailValue)}&username=${encodeURIComponent(usernameValue)}`;

    xhr.open('POST', 'EmailCheck');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(data);

}

function showModal(mes) {
    const OkButton = document.getElementById("OkBt");
    const messageModal = document.getElementById("modal-message");
    messageModal.textContent = mes;
    document.getElementById("myModal").style.display = "block";
    OkButton.addEventListener("click",  () => {
        document.getElementById("myModal").style.display = "none";
        window.location.reload();
    });
}

function removeExtras() {
    SafeMode(true);
    const mess = document.getElementById("Edit-message");
    mess.textContent = "Edit";
    strengthMessage.style.display = 'none';
    ChangesBt.style.display = 'none';
    LogoutCont.style.display = 'inline-block';
    getUserData();

    LocationBt.style.display = 'none';
    $('#email-error').empty();
    validEmail = true;

}

function fillTheForm(responseData){
    for (const x in responseData) {
        var category = x;
        var value = responseData[x];
        if (category === "user_id"){
            userType.value = "users";
        }else if (category === "volunteer_id")
        {
            userType.value = "volunteers";
            volunteerFields.style.display = "block";
            RequiredFields(true);
            termsMessage.textContent = "Δηλώνω υπεύθυνα ότι ανήκω στο ενεργό δυναμικό των εθελοντών πυροσβεστών.";
            continue;
        }
        let field = document.getElementById(`${category}`);
        if (field != null){
             if(category === 'country' || category === 'prefecture')
            {
                const options = field.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].textContent.trim() === value) {
                        value = options[i].value;
                        break;
                    }
                }
            }

            field.value = value;
        }
        else{
            if (category === 'gender')
            {
               switch (value){
                   case "Male":
                       document.getElementById("Mr.").checked = true;
                       break;
                   case "Female":
                       document.getElementById("Ms.").checked = true;
                       break;
                   case "Other":
                       document.getElementById("Other.").checked = true;
                       break;
               }
            }
            // console.log("NUll filed:" + category + " value: " + value );

        }
    }
    SafeMode(true);

}

function getUserData(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            fillTheForm(responseData);
            var html="";
            for (const x in responseData) {
                var category = x;
                var value = responseData[x];
                html += category + ": [" + value + "] ";
            }
            // console.log(html);
        } else if (xhr.status !== 200) {
            // alert('Request failed. Returned status of ' + xhr.status);

        }
    };

    xhr.open('GET', 'Login');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function loggedInUser(state){
    const form1 = document.getElementById("myForm1");
    const form2 = document.getElementById("myForm2");
    if (state)
    {
        form1.style.display = 'none';
        form2.style.display = 'inline-block';
        Edit.style.display = 'inline';
        LogoutCont.style.display = 'inline-block';
        getUserData();
        LocationBt.style.display = 'none';

    }else{
        form1.style.display = 'inline-block';
        form2.style.display = 'none';
        Edit.style.display = 'none';
        LogoutCont.style.display = 'none';
        LocationBt.style.display = 'none';

    }

}
function loginPOST() {
    const errCredentials = document.getElementById("error-login");
    var data = $('#myForm1').serialize();
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            errCredentials.style.display = 'none';
            loggedInUser(true);
        } else if (xhr.status !== 200) {
            errCredentials.style.display = 'inline';
        }
    };

    xhr.open('POST', 'Login');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(data);
    return false;
}


document.addEventListener("DOMContentLoaded", function () {
    const form2 = document.getElementById('myForm2');
    let changedFields = {};
    const genderRadios = document.querySelectorAll('input[name="gender"]');

    form2.querySelectorAll('input, select, textarea').forEach((field) => {
        field.addEventListener('change', () => {
            if (field.defaultValue !== field.value) {
                changedFields[field.name] = field.value;
            } else {
                delete changedFields[field.name];
            }
        });
    });

    genderRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            changedFields['gender'] = event.target.value;
        });
    });

    form2.addEventListener('submit', function (event) {
        event.preventDefault();

        const serializedData = Object.keys(changedFields)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(changedFields[key])}`)
            .join('&');

        // console.log("serializedData: ["+serializedData+"]" );
        if(!CheckChanges(serializedData))
            changedFields = {};
        removeExtras();
        getUserData();

    });
});

function CheckChanges(changedFields) {
    document.getElementById("Edit-message").textContent = 'Edit';
    checkPasswordStrength(passwordField.value);
    if (PasswordStatus !== "Medium" && PasswordStatus !== "Strong") {
        alert("Add stronger Password");
        return false;
    } else if (!ageCheck()) {
        alert("You do not meet age requirements");
        return false;
    }else if (!validEmail)
    {
        alert("There is already an account with this email");
        return false;
    }else if (Object.keys(changedFields).length === 0)
    {
        console.log("No changes returning...");
        return false;
    }else if(!verifiedLocation){
        alert("Verify your location before you submit the changes");
        return false;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let err = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            console.log("Response from server:" + responseData);
            $('#general-error').empty();
        } else if (xhr.status !== 200) {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };

    xhr.open('POST', 'UpdateUser');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(changedFields);
    return  true;

}

function logout(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            loggedInUser(false);
            showModal("Successful Logout");
        } else if (xhr.status !== 200) {
            console.log('Request failed. Returned status of ' + xhr.status)
        }
    };
    xhr.open('POST', 'Logout');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}

$(document).ready(function () {
    isLoggedIn();
});
function isLoggedIn() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            loggedInUser(true);
        } else if (xhr.status !== 200) {
            console.log('No session');
        }
    };
    xhr.open('GET', 'Login');
    xhr.send();
}