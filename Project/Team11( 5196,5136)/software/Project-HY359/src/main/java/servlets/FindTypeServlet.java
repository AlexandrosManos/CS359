package servlets;

import com.google.gson.JsonObject;
import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.User;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;

@WebServlet(name = "FindTypeServlet", value = "/FindTypeServlet")
public class FindTypeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        String username = (String) session.getAttribute("loggedIn");

        String userType = "guest";
        String userName = null; // optional param
        Double lat = null, lon = null;

        try{
            EditUsersTable findUser = new EditUsersTable();
            EditVolunteersTable findVol = new EditVolunteersTable();
            User user = findUser.databaseToUsers(username);
            Volunteer volunteer = findVol.databaseToVolunteer(username);

            // this is a regular user
            if(user != null){
                userType = "user";
                userName = user.getUsername();
                lat = user.getLat();
                lon = user.getLon();
            }else if(volunteer != null){
                userType = "volunteer";
                userName = volunteer.getUsername();
                lat = volunteer.getLat();
                lon = volunteer.getLon();

            }
            System.out.println("userType: " + userType + " userName " + userName);
            JsonObject jo = new JsonObject();
            jo.addProperty("userType", userType);

            if (userName != null) {
                jo.addProperty("userName", userName);
                jo.addProperty("lat", lat);
                jo.addProperty("lon", lon);
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            System.out.println("jo string: " + jo.toString());
            response.getWriter().write(jo.toString());
            response.setStatus(200);

        }catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}