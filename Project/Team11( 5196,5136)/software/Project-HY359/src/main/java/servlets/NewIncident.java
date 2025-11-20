package servlets;

import database.init.JSON_Converter;
import database.tables.EditIncidentsTable;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "NewIncident", value = "/NewIncident")
public class NewIncident extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        /* This will be used to convert the data we send from the js to be inserted instantly from
        the functions we already have in the DB for the Incident table
         */
        JSON_Converter jc  = new JSON_Converter();

        String new_incident_data = jc.getJSONFromAjax(request.getReader());
        System.out.println(new_incident_data);

        try{
            EditIncidentsTable newInc = new EditIncidentsTable();
            newInc.addIncidentFromJSON(new_incident_data);

            response.setContentType("application/json");
            response.getWriter().write("{\"status\": \"success\", \"message\": \"User added successfully.\"}");
            response.setStatus(200);

        }catch ( ClassNotFoundException ex){
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}