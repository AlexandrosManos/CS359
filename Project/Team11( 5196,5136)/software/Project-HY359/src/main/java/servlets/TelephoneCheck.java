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

@WebServlet(name = "TelephoneCheck", value = "/TelephoneCheck")
public class TelephoneCheck extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String telephone=request.getParameter("telephone");
        System.out.println("Checking telephone: " + telephone);
        CheckForDuplicatesExample check = new CheckForDuplicatesExample();

        try {
            if (!check.isTelephoneAvailable(telephone)) {
                System.out.println(check.telMess);
                response.setStatus(409);
                JsonObject jo = new JsonObject();
                jo.addProperty("error",check.telMess);
                response.getWriter().write(jo.toString());
            } else {
                response.setStatus(200);
                response.getWriter().write(telephone);
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