# CS-359 Web Programming Coursework & E-199 Project

This repository contains the coursework and final project for the course **CS-359 Web Programming** (University of Crete, 2024-2025). The repository demonstrates a progression from static front-end design to a complex, full-stack web application.

##  Featured Project: E-199 Emergency Response Platform

**E-199** is a comprehensive web-based information system designed to facilitate immediate interaction between the **Fire Service**, **Volunteer Firefighters**, and **Citizens** during emergency incidents (fires, accidents, etc.).

###  Key Features
The system supports 4 distinct user roles with specific functionalities:

* ** Fire Service Admin:**
    * Full control over incident management (create, update, finish).
    * **Resource Management:** Coordinate volunteer requests and vehicle allocation.
    * **Statistics Dashboard:** Visualization of incident data using **Google Charts** (Pie/Bar charts).
    * **Communication:** Send public alerts or private messages to volunteers.
* ** Registered User:**
    * **Real-time Reporting:** Report incidents including GPS location.
    * **Proximity Alerts:** Receive immediate notifications for incidents occurring near their registered address/municipality.
    * **History:** View personal reporting history.
* ** Volunteer Firefighter:**
    * **Mission Acceptance:** View active calls for help and accept/decline participation.
    * **Live Chat:** Communicate directly with the Admin during active missions.
* **👀 Guest:**
    * Quick incident reporting (SMS verification style).
    * View a live map of active incidents across Crete.

###  Tech Stack & APIs
* **Backend:** Java Servlets, JSP, RESTful Architecture.
* **Database:** MySQL.
* **Frontend:** HTML5, CSS3, Bootstrap, JavaScript (ES6+), AJAX / jQuery.
* **External APIs:**
    * **OpenStreetMaps (OSM) & Nominatim:** For geocoding and map visualization.
    * **RapidAPI (Trueway Matrix):** For calculating driving distances and routing between incidents and volunteers.
    * **OpenAI (ChatGPT):** Integrated to provide users with instant safety advice (e.g., "How to handle a chemical fire").
    * **Google Charts:** For administrative data visualization.

---

##  Course Assignments
The project was built upon three progressive assignments:

### Assignment 3: Backend & REST API
* **Goal:** Connect the frontend to a MySQL database and implement server-side logic.
* **Key Implementations:**
    * **Java Servlets:** Handled user registration, login/logout sessions, and data persistence.
    * **REST API:** Developed a standalone API for CRUD operations on Incidents (`GET /incidents`, `POST /incident`, `DELETE`, etc.).
    * **AJAX:** Implemented asynchronous checks for username/email availability without reloading the page.

### Assignment 2: JavaScript & Maps
* **Goal:** Master Client-side logic and DOM manipulation.
* **Key Implementations:**
    * **Form Validation:** Custom password strength meters and mismatch detection.
    * **Map Integration:** Implemented OpenLayers/OSM to pin locations and validate addresses via reverse geocoding.
    * **Mini-Game:** A "Snakes and Ladders" browser game using pure JavaScript and DOM logic.

### Assignment 1: HTML5 & CSS3
* **Goal:** Design responsive layouts and semantic structure.
* **Key Implementations:**
    * **Personal Website:** A responsive CV page using Media Queries.
    * **Registration Frontend:** The initial UI for the E-199 platform using Bootstrap grid systems.
