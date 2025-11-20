package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.tables.CheckForDuplicatesExample;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@WebServlet(name = "UsernameCheck", value = "/UsernameCheck")
public class UsernameCheck extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(request.getInputStream(), "UTF-8")
        );

        String username = reader.lines().collect(Collectors.joining());
        System.out.println("Checking username: " + username);
        CheckForDuplicatesExample check = new CheckForDuplicatesExample();

        try {
            if (!check.isUserNameAvailable(username)) {
                System.out.println(check.usernameMess);
                response.setStatus(409);
                JsonObject jo = new JsonObject();
                jo.addProperty("error",check.usernameMess);
                response.getWriter().write(jo.toString());
            } else {
                response.setStatus(200);
                response.getWriter().write(username);
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
}