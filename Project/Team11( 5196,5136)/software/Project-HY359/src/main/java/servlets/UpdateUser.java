package servlets;

import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.User;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "UpdateUser", value = "/UpdateUser")
public class UpdateUser extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");

        HttpSession session = request.getSession();
        String loggedInUsername = (String) session.getAttribute("loggedIn");

        Map<String, String[]> parameterMap = request.getParameterMap();

        try (PrintWriter out = response.getWriter()) {
            EditUsersTable eut = new EditUsersTable();
            User su = eut.databaseToUsers(loggedInUsername);
            if (su == null) {
                EditVolunteersTable evt = new EditVolunteersTable();
                Volunteer sv = evt.databaseToVolunteer(loggedInUsername);
                if (sv == null)
                    response.setStatus(403);

                for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                    String key = entry.getKey();
                    String[] values = entry.getValue();
                    String joinedValues = String.join(" ", values);
                    evt.updateVolunteer(loggedInUsername,key, joinedValues);
                }
                String json = evt.volunteerToJSON(sv);
                out.println(json);
                response.setStatus(200);
            } else {
                for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                    String key = entry.getKey();
                    String[] values = entry.getValue();
                    String joinedValues = String.join(" ", values);
                    eut.updateUser(loggedInUsername,key, joinedValues);
                }

                String json = eut.userToJSON(su);
                out.println(json);
                response.setStatus(200);
            }
        } catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

}