package servlets;

import database.tables.EditIncidentsTable;
import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.Incident;
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

@WebServlet(name = "NotificationServlet", value = "/NotificationServlet")
public class NotificationServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table
        HttpSession session = request.getSession();
        String Username = (String) session.getAttribute("loggedIn");
        String mun ;
        User user;
        Volunteer volunteer;

        if(Username != null) {
            EditUsersTable eut = new EditUsersTable();
            EditVolunteersTable evt = new EditVolunteersTable();
            try {
                 user = eut.databaseToUsers(Username);
                 volunteer = evt.databaseToVolunteer(Username);
            } catch (SQLException e) {
                throw new RuntimeException(e);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
            }
            if (user != null)
             mun = user.getMunicipality();
            else
                mun = volunteer.getMunicipality();
            try (PrintWriter out = response.getWriter()) {
                EditIncidentsTable all_incidents = new EditIncidentsTable();
                ArrayList<Incident> store_incidents;
                store_incidents = all_incidents.GetIncidentsNearby(mun);

                if (store_incidents == null)
                    response.setStatus(400);
                String json = all_incidents.incidentsToJSON(store_incidents);
                out.println(json);
                response.setStatus(200);


            } catch (SQLException | ClassNotFoundException ex) {
                Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}