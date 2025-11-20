package servlets;

import database.tables.EditIncidentsTable;
import database.tables.EditMessagesTable;
import mainClasses.Incident;
import mainClasses.Message;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "UpdateMessage", value = "/UpdateMessage")
public class UpdateMessage extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table

        try(PrintWriter out = response.getWriter()) {
            EditMessagesTable emt = new EditMessagesTable();
            ArrayList<Message> messages;
            messages = emt.databaseToMessages();

            if (messages == null)
                response.setStatus(400);
            String json = emt.messagesToJSON(messages);
            out.println(json);
            response.setStatus(200);


        }catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("text/html;charset=UTF-8");

        String IdParam = request.getParameter("message_id");
        int message_id;
        try {
            message_id = Integer.parseInt(IdParam);
        } catch (NumberFormatException e) {
            response.setStatus(400); // Bad Request
            response.getWriter().println("Invalid message_id format.");
            System.out.println("Bad request");
            return;
        }

        Map<String, String[]> parameterMap = request.getParameterMap();

        try (PrintWriter out = response.getWriter()) {
            EditMessagesTable emt = new EditMessagesTable();
            Message si = emt.databaseToMessage(message_id);
            if (si != null) {

                for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                    String key = entry.getKey();
                    if (!key.equals("message_id"))
                    {
                        String[] values = entry.getValue();
                        String joinedValues = String.join(" ", values);
                        emt.updateMessage(String.valueOf(message_id),key, joinedValues);
                    }
                }

                String json = emt.messageToJSON(si);
                out.println(json);
                response.setStatus(200);
            }
        } catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}