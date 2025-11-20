package servlets;

import database.tables.EditIncidentsTable;
import mainClasses.Incident;


import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "UpdateIncident", value = "/UpdateIncident")
public class UpdateIncident extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");

        String incidentIdParam = request.getParameter("incident_id");
        int incident_id;
        try {
            incident_id = Integer.parseInt(incidentIdParam);
        } catch (NumberFormatException e) {
            response.setStatus(400); // Bad Request
            response.getWriter().println("Invalid incident_id format.");
            System.out.println("Bad request");
            return;
        }

        Map<String, String[]> parameterMap = request.getParameterMap();

        try (PrintWriter out = response.getWriter()) {
            EditIncidentsTable eit = new EditIncidentsTable();
            Incident si = eit.databaseToIncident(incident_id);
            if (si != null) {

                for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                    String key = entry.getKey();
                    if (!key.equals("incident_id"))
                    {
                        String[] values = entry.getValue();
                        String joinedValues = String.join(" ", values);
                        if (key.equals("status"))
                        {
                            if (joinedValues.equalsIgnoreCase("finished"))
                            {
                                si.setEnd_datetime();
                                eit.updateIncident(String.valueOf(incident_id),"end_datetime", si.getEnd_datetime());
                            }else if (joinedValues.equalsIgnoreCase("running"))
                            {
                                si.setStart_datetime();
                                eit.updateIncident(String.valueOf(incident_id),"start_datetime", si.getStart_datetime());
                            }
                        }
                        eit.updateIncident(String.valueOf(incident_id),key, joinedValues);
                    }
                }

                String json = eit.incidentToJSON(si);
                out.println(json);
                response.setStatus(200);
            }
        } catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}