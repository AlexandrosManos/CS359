package servlets;

import com.google.gson.JsonObject;
import database.tables.EditIncidentsTable;
import mainClasses.Incident;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

@WebServlet(name = "IncidentsStats", value = "/IncidentsStats")
public class IncidentsStats extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String type=request.getParameter("type");
        JsonObject jo = new JsonObject();
        EditIncidentsTable eit = new EditIncidentsTable();
        HashMap<String,Integer> hash_incidents =new HashMap<>();
        ArrayList<Incident> incidents;
        try {
            incidents=eit.databaseToIncidents();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }

        for(Incident inc:incidents){
            String incident_type = inc.getIncident_type();
            if(hash_incidents.containsKey(incident_type)){
                hash_incidents.put(incident_type, hash_incidents.get(incident_type)+1);
            }
            else{
                hash_incidents.put(incident_type,1);
            }
        }
        for(String x: hash_incidents.keySet()){
            jo.addProperty(x, hash_incidents.get(x)+"");
        }
        String json = jo.toString();
        response.setStatus(200);
        response.getWriter().write(json);

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}