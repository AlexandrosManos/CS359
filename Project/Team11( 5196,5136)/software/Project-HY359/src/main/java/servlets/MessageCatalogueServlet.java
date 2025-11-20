package servlets;

import com.google.gson.JsonObject;
import database.init.JSON_Converter;
import database.tables.EditIncidentsTable;
import database.tables.EditMessagesTable;
import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.Message;
import mainClasses.User;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

@WebServlet(name = "MessageCatalogueServlet", value = "/MessageCatalogueServlet")
public class MessageCatalogueServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        String username = (String) session.getAttribute("loggedIn");
        try{
            ArrayList<Message> messages = null;
            EditMessagesTable emt = new EditMessagesTable();

            messages = emt.adminChatLog(username);


            String json = emt.messagesToJSON(messages);
            response.getWriter().write(json);

            System.out.println("Messages : " + messages);


            System.out.println("All the messages for : " + json);

            response.setStatus(200);

        }catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");

        String incident_id = request.getParameter("incident_id");

        System.out.println("Incident id : " + incident_id);

        String optionalParam = request.getParameter("param");
        System.out.println("MessageCatalogueServlet optionalParam: " + optionalParam);

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

        System.out.println("Int id : " + incidentId);

        try {
            ArrayList<Message> messages = null;
            if(optionalParam == null)
                messages= Catalogue.databaseToMessages(incidentId);
            else
                messages = Catalogue.databaseToMessages(incidentId,optionalParam);

            System.out.println("Messages : " + messages);

            String json = Catalogue.messagesToJSON(messages);

            System.out.println("All the messages for : " + incident_id + " are : " + json);

            response.getWriter().write(json);

                response.setStatus(200);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}