package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.tables.CheckForDuplicatesExample;
import database.tables.EditParticipantsTable;
import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.Participant;
import mainClasses.User;
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

@WebServlet(name = "AllParticipants", value = "/AllParticipants")
public class AllParticipants extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table

        try(PrintWriter out = response.getWriter()) {
            EditParticipantsTable ept = new EditParticipantsTable();
            ArrayList<Participant> ptrs;
            ptrs = ept.databaseToParticipant();

            if (ptrs == null)
                response.setStatus(400);
            String json = ept.participantsToJSON(ptrs);
            out.println(json);
            response.setStatus(200);

        }catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        EditParticipantsTable ept = new EditParticipantsTable();
        Participant ptr = ept.jsonToParticipant(request.getReader());
        String JsonString = ept.participantToJSON(ptr);

        System.out.println(ptr);

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
            ept.createNewParticipant(ptr);
            response.setStatus(200);
            response.getWriter().write(JsonString);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}