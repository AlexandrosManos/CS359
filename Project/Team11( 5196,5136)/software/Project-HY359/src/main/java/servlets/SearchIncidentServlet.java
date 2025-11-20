package servlets;

import com.google.gson.Gson;
import database.init.JSON_Converter;
import database.tables.EditIncidentsTable;
import mainClasses.Incident;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Map;

@WebServlet(name = "SearchIncidentServlet", value = "/SearchIncidentServlet")
public class SearchIncidentServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // we dont need the http session attribute since the search navigation
        // is visible only to registered userType = normal users

        response.setContentType("text/html;charset=UTF-8");

        JSON_Converter jc = new JSON_Converter();
        String data = jc.getJSONFromAjax(request.getReader());

        System.out.println("data " + data);

        Gson gson = new Gson();
        Map<String, String> requestData = gson.fromJson(data, Map.class);

        // Extract individual fields
        String municipality = requestData.get("municipality");
        String incidentType = requestData.get("incident_type");
        String startDate = requestData.get("start_datetime");
        String endDate = requestData.get("end_datetime");
        int firefightersCount = Integer.parseInt(requestData.get("firefightersCount"));
        int vehiclesCount = Integer.parseInt(requestData.get("vehiclesCount"));



        try(PrintWriter out = response.getWriter()) {
            EditIncidentsTable eit = new EditIncidentsTable();
            Incident incident = new Incident();
            try {
                incident = eit.SearchIncident(municipality,incidentType,startDate,endDate,firefightersCount,vehiclesCount);
                System.out.println("incident after function call :  " + incident);
                if(incident!=null){
                    String json = eit.incidentToJSON(incident);
                    out.println(json);
                    response.setStatus(200);
                }else{
                    response.setStatus(403);
                }
            } catch (SQLException | ClassNotFoundException e) {
                throw new RuntimeException(e);
            }
        }
    }
}