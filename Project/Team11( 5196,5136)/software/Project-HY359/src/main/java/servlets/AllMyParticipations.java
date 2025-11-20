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

@WebServlet(name = "AllMyParticipations", value = "/AllMyParticipations")
public class AllMyParticipations extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table

        HttpSession session = request.getSession();
        String Username = (String) session.getAttribute("loggedIn");

        try(PrintWriter out = response.getWriter()) {
            EditParticipantsTable epd = new EditParticipantsTable();
            String resp = epd.getHistory(Username);
            if (resp == null) {
                resp = "{}";
            }
            out.print(resp);
            response.setStatus(200);
        }catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
            response.setStatus(500);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}