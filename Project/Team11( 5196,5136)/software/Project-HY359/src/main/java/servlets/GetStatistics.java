package servlets;

import com.google.gson.JsonObject;
import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.Incident;
import mainClasses.User;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

@WebServlet(name = "GetStatistics", value = "/GetStatistics")
public class GetStatistics extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String type=request.getParameter("type");
        JsonObject jo = new JsonObject();
        EditVolunteersTable evt = new EditVolunteersTable();
        ArrayList<Volunteer> volunteers;

        try {
            volunteers = evt.databaseToVolunteers();
            if(type.equals("users")){
                EditUsersTable eut = new EditUsersTable();
                ArrayList<User> users;
                users=eut.databaseToUsers();


                jo.addProperty("Users",""+ users.size());
                jo.addProperty("Volunteers",""+volunteers.size());
                String json = jo.toString();
                response.setStatus(200);
                response.getWriter().write(json);
            }
            else if(type.equals("volunteers")){
                int simpleCount = 0, driversCount = 0;
                for (Volunteer volunteer : volunteers)
                {
                    if (volunteer.getVolunteer_type().equals("simple"))
                        simpleCount++;
                    else
                        driversCount++;
                }
                jo.addProperty("Simple",""+ simpleCount);
                jo.addProperty("Drivers",""+driversCount);
                String json = jo.toString();
                response.setStatus(200);
                response.getWriter().write(json);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}