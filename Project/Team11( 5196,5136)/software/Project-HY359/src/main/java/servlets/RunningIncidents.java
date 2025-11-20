package servlets;
import database.tables.EditIncidentsTable;
import database.tables.EditParticipantsTable;
import database.tables.EditVolunteersTable;
import mainClasses.Incident;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "RunningIncidents", value = "/RunningIncidents")
public class RunningIncidents extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table
        String optionalParam = request.getParameter("param");
        System.out.println("optionalParam: " + optionalParam);
        String msg="";

        HttpSession session = request.getSession();
        String Username = (String) session.getAttribute("loggedIn");

        try(PrintWriter out = response.getWriter()) {
            EditIncidentsTable all_incidents = new EditIncidentsTable();
            ArrayList<Incident> store_incidents;
            if (optionalParam != null && optionalParam.equals("MyRunningIncidents") && Username != null)
            {
                store_incidents = all_incidents.GetMyRunningIncidents(Username);
            }
            else
                store_incidents = all_incidents.GetRunningIncidents();

            if (store_incidents == null)
                response.setStatus(400);

            String json;
            if (optionalParam != null && !optionalParam.equals("MyRunningIncidents"))
            {
                json ="[";
                EditVolunteersTable evt = new EditVolunteersTable();
                EditParticipantsTable ept = new EditParticipantsTable();
                Volunteer vol = evt.databaseToVolunteer(optionalParam);
                String status;
                int type;
                for (Incident incident : store_incidents){
                    json += all_incidents.incidentToJSON(incident);
                    type = vol.getVolunteer_type().equals("simple") ? incident.getFiremen() : incident.getVehicles();
                    status = ept.getStatus(incident.getIncident_id(), vol.getUsername());
                    if (status == null){
                        if (type <= 0)
                            msg = "Not Available";
                        else
                            msg = "Request To Participate";
                    }else
                        msg = status;

                    json = json.substring(0, json.length() - 1) + ", \"message\": \"" + msg + "\"},";
                    System.out.println("json.substring : " + json);
                }
                if (json.length() > 1)
                    json = json.substring(0, json.length() - 1);
                json += "]";
            }else
            {
                json = all_incidents.incidentsToJSON(store_incidents);

            }
            System.out.println("Finally json.substring : " + json);


            out.println(json);
            response.setStatus(200);


        }catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}