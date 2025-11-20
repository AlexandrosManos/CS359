package servlets;

import com.google.gson.JsonObject;
import database.tables.CheckForDuplicatesExample;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@WebServlet(name = "EmailCheck", value = "/EmailCheck")
public class EmailCheck extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username=request.getParameter("username");
        String email=request.getParameter("email");
        System.out.println("Checking email: " + email);
        CheckForDuplicatesExample check = new CheckForDuplicatesExample();

        try {
            if (!check.isEmailAvailable(email,username)) {
                System.out.println(check.emailMess);
                response.setStatus(409);
                JsonObject jo = new JsonObject();
                jo.addProperty("error",check.emailMess);
                response.getWriter().write(jo.toString());
            } else {
                response.setStatus(200);
                response.getWriter().write(email);
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