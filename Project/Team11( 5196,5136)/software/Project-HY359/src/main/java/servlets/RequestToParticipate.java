package servlets;

import database.tables.EditParticipantsTable;
import database.tables.EditVolunteersTable;
import mainClasses.Participant;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet(name = "RequestToParticipate", value = "/RequestToParticipate")
public class RequestToParticipate extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        EditParticipantsTable ept = new EditParticipantsTable();
        Participant ptr = new Participant();
        String JsonString;

        response.setContentType("text/html;charset=UTF-8");

//        Find the incident_id
        String IdParam = request.getParameter("incident_id");
        int incident_id;
        try {
            incident_id = Integer.parseInt(IdParam);
        } catch (NumberFormatException e) {
            response.setStatus(400); // Bad Request
            response.getWriter().println("Invalid incident_id format.");
            System.out.println("Bad request");
            return;
        }

        HttpSession session = request.getSession();
        String loggedInUsername = (String) session.getAttribute("loggedIn");
        if (loggedInUsername != null)
        {
            EditVolunteersTable evt = new EditVolunteersTable();
            Volunteer sv = null;
            try {
                sv = evt.databaseToVolunteer(loggedInUsername);
            } catch (SQLException e) {
                throw new RuntimeException(e);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
            }
            if (sv != null)
            {
                ptr.setIncident_id(incident_id);
                ptr.setVolunteer_username(loggedInUsername);
                ptr.setStatus("requested");
                ptr.setVolunteer_type(sv.getVolunteer_type());
            }

        }

        try {
            JsonString = ept.participantToJSON(ptr);
            ept.createNewParticipant(ptr);
            response.setStatus(200);
            response.getWriter().write(JsonString);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}