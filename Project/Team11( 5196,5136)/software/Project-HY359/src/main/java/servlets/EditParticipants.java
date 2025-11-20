package servlets;

import database.tables.EditMessagesTable;
import database.tables.EditParticipantsTable;
import mainClasses.Message;
import mainClasses.Participant;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "EditParticipants", value = "/EditParticipants")
public class EditParticipants extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("text/html;charset=UTF-8");

        String IdParam = request.getParameter("participant_id");
        int participant_id;
        try {
            participant_id = Integer.parseInt(IdParam);
        } catch (NumberFormatException e) {
            response.setStatus(400); // Bad Request
            response.getWriter().println("Invalid participant_id format.");
            System.out.println("Bad request");
            return;
        }

        Map<String, String[]> parameterMap = request.getParameterMap();

        try (PrintWriter out = response.getWriter()) {
            EditParticipantsTable ept = new EditParticipantsTable();
            Participant si = ept.databaseToParticipant(participant_id);
            if (si != null) {

                for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                    String key = entry.getKey();
                    if (!key.equals("participant_id"))
                    {
                        String[] values = entry.getValue();
                        String joinedValues = String.join(" ", values);
                        ept.updateParticipant(String.valueOf(participant_id),key, joinedValues);
                    }
                }

                String json = ept.participantToJSON(si);
                out.println(json);
                response.setStatus(200);
            }
        } catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}