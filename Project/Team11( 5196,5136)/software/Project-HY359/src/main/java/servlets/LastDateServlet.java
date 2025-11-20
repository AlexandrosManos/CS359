package servlets;

import database.tables.EditIncidentsTable;
import database.tables.EditMessagesTable;
import database.tables.EditUsersTable;
import mainClasses.Message;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "LastDateServlet", value = "/LastDateServlet")
public class LastDateServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");

        String incident_id = request.getParameter("incident_id");

        System.out.println("LAST DATE Incident id : " + incident_id);

        int incidentId;

        EditMessagesTable Catalogue = new EditMessagesTable();

        try {
            incidentId = Integer.parseInt(incident_id);
        } catch (NumberFormatException e) {
            response.setStatus(400); // Bad Request
            response.getWriter().println("Invalid id format.");
            System.out.println("Bad request");
            return;
        }

        System.out.println("LAST DATE Int id : " + incidentId);

        try {


            String LastDate =Catalogue.LastMessageDate(incidentId);

            System.out.println("Last Date : " + LastDate );

            response.getWriter().write(LastDate);

            response.setStatus(200);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}