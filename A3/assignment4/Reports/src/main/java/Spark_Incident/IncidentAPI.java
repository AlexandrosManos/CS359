package Spark_Incident;

import com.google.gson.Gson;
import database.tables.EditIncidentsTable;
import mainClasses.Incident;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.put;

    public class IncidentAPI {

        static ArrayList<Incident> incH = new ArrayList<>();

        static String apiPath = "IncidentAPI/service/";

        public static void main(String[] args) throws SQLException, ClassNotFoundException {
            EditIncidentsTable wt = new EditIncidentsTable();
            incH = wt.databaseToIncidents();
//            System.out.println(incH);

            // add an incident (1st bullet)
            //http://localhost:4567/IncidentAPI/service/incident
            post(apiPath + "/incident", (request, response) -> {
                response.type("application/json");
                EditIncidentsTable editIncidents = new EditIncidentsTable();
                Incident incident = editIncidents.jsonToIncident(request.body());
                String check = validIncident(incident);

                if (check != null) {
                    response.status(406);
                    return new Gson().toJson(new StandardResponse(new Gson()
                            .toJson(check)));
                }
                System.out.println(incident);
                incident.setStatus("submitted");
                incident.setDanger("unknown");
                incident.setStart_datetime();
                editIncidents.createNewIncident(incident);

                response.status(200);
                return new Gson().toJson(new StandardResponse(new Gson()
                        .toJson("Success: Incident added")));
            });

            // get all incidents
            //http://localhost:4567/IncidentAPI/service/incidents
            get(apiPath + "/incidents", (request, response) -> {
                response.status(200);
                response.type("application/json");
                EditIncidentsTable editIncidents = new EditIncidentsTable();
                return new Gson().toJson(
                        new StandardResponse(
                                new Gson().toJsonTree(editIncidents.databaseToIncidents())));
            });

            // get specific incident based on type, status and municipality (optionally) -> 2nd bullet
            //http://localhost:4567/IncidentAPI/service/incidents/fire/running
            get(apiPath + "/incidents/:type/:status", (request, response) -> {
                response.type("application/json");
                String type = request.params(":type");
                String status = request.params(":status");
                String municipality = request.queryParams("municipality");
                if (municipality == null)
                    municipality = "";
                System.out.println("type:[" +type + "],  status:[" + status + "], municipality:[" +municipality+ "]");
                EditIncidentsTable editIncidents = new EditIncidentsTable();
                ArrayList<Incident> incidents = editIncidents.databaseToIncidentsSearch(type,status,municipality);
                System.out.println(incidents);
                if (!incidents.isEmpty()) {
                    String json = new Gson().toJson(incidents);
                    response.status(200);
                    return new Gson().toJson(new StandardResponse(new Gson().toJsonTree(incidents)));
                } else {
                    response.status(404);
                    return new Gson().toJson(new StandardResponse(new Gson()
                            .toJson("Error: Incidents Not Found")));
                }
            });

            // update the status of an incident (3rd bullet)
            //http://localhost:4567/IncidentAPI/service/incidentStatus/1/finished
            put(apiPath + "/incidentStatus/:incident_id/:status", (request, response) -> {
                response.type("application/json");

                String incident_id = request.params(":incident_id");
                String status = request.params(":status");
                HashMap<String, String> updates = new HashMap<>();
                EditIncidentsTable editIncidents = new EditIncidentsTable();

                Incident incident = editIncidents.findIncident(incident_id);
                if (incident == null) {
                    response.status(403);
                    return new Gson().toJson(new StandardResponse(new Gson().toJson("Incident  not found")));
                } else if (!status.toLowerCase().matches("fake|running|finished")) {
                    response.status(406);
                    return new Gson().toJson(new StandardResponse(new Gson().toJson("Unknown status")));
                } else if (incident.getStatus().equalsIgnoreCase("submitted")
                    &&!status.toLowerCase().matches("fake|running") ) {
                response.status(406);
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Wrong status update")));

                }else if (incident.getStatus().equalsIgnoreCase("running")
                    &&!status.equalsIgnoreCase("finished") ) {
                response.status(406);
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Wrong status update")));
                }
                else {
                    updates.put("status", status);
                    // to lowerCase().equals => equalsIgnoreCase
                    if (status.equalsIgnoreCase("finished"))
                    {
                        incident.setEnd_datetime();
                        updates.put("end_datetime", incident.getEnd_datetime());
                    }
                    editIncidents.updateIncident(incident_id, updates);
                    return new Gson().toJson(new StandardResponse(new Gson().toJson("Success: Quantity Updated")));
                }
            });

            // Delete incident (last bullet)
            // http://localhost:4567/IncidentAPI/service/incidentDeletion/2
            delete(apiPath + "/incidentDeletion/:incident_id", (request, response) -> {
                response.type("application/json");

                String incident_id = request.params(":incident_id");
                EditIncidentsTable editIncidents = new EditIncidentsTable();

                Incident incident = editIncidents.findIncident(incident_id);

                if (incident != null) {
                    response.status(200);
                    editIncidents.deleteIncident(incident_id);
                    return new Gson().toJson(new StandardResponse(new Gson().toJson("Incident Deleted")));
                }
                 else {
                    response.status(404);
                    return new Gson().toJson(new StandardResponse(new Gson().toJson("Error: Incident not found")));
                }
            });


        }

        // check if all values are valid using regex
        private static String validIncident(Incident incident) {
            if (!incident.getUser_phone().matches("\\d{10,14}")) {
                return "Error: enter a valid telephone number (10-14 digits)";
            }
            if (!incident.getUser_type().toLowerCase().matches("guest|admin|user")) {
                return "Error: valid user_type are guest, admin or user";
            }
            if (!incident.getIncident_type().toLowerCase().matches("fire|accident")) {
                return "Error: unknown incident_type, type fire or accident";
            }


            if (incident.getPrefecture() != null && !incident.getPrefecture().toLowerCase().matches("heraklion|chania|rethymno|lasithi")) {
                return "Error: valid prefecture are heraklion, chania, rethymno, or lasithi";
            }
            return null;
        }
    }
