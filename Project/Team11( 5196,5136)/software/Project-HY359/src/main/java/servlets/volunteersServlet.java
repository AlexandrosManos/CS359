package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import database.tables.CheckForDuplicatesExample;
import database.tables.EditVolunteersTable;
import mainClasses.Volunteer;


import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;


@WebServlet(name = "volunteersServlet", value = "/volunteersServlet")
public class volunteersServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        // Create an instance in order to access the Incidents table

        try(PrintWriter out = response.getWriter()) {
            EditVolunteersTable eut = new EditVolunteersTable();
            ArrayList<Volunteer> volunteers;
            volunteers = eut.databaseToVolunteers();

            if (volunteers == null)
                response.setStatus(400);
            String json = eut.volunteersToJSON(volunteers);
            out.println(json);
            response.setStatus(200);

        }catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        System.out.println("Adding volunteer....");
        EditVolunteersTable jc = new EditVolunteersTable();
        Volunteer p = jc.jsonToVolunteer(request.getReader());
        String JsonString = jc.volunteerToJSON(p);
        System.out.println(p);
        PrintWriter out = response.getWriter();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        CheckForDuplicatesExample check = new CheckForDuplicatesExample();
        try {
            String errorM = check.checkAll(p.getUsername(),p.getTelephone(),p.getEmail());
            System.out.println(errorM);
            if (errorM != null) {
                System.out.println(errorM);
                response.setStatus(409);
                Gson gson = new Gson();
                JsonObject jo = new JsonObject();
                jo.addProperty("error", "Username");
                response.getWriter().write(jo.toString());
            } else {
                jc.addNewVolunteer(p);
                response.setStatus(200);
                response.getWriter().write(JsonString);
            }
        }
        catch (SQLException ex) {
            response.sendError(500);
            Logger.getLogger(InitDB.class.getName()).log(Level.SEVERE, null, ex);
        }catch (ClassNotFoundException e) {
            response.sendError(500);
            throw new RuntimeException(e);
        }


    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}