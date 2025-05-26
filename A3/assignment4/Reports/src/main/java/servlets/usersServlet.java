package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.tables.CheckForDuplicatesExample;
import database.tables.EditUsersTable;
import mainClasses.User;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;


@WebServlet(name = "usersServlet", value = "/usersServlet")
public class usersServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        System.out.println("Adding User....");
        EditUsersTable jc = new EditUsersTable();
        User user = jc.jsonToUser(request.getReader());
        String JsonString = jc.userToJSON(user);
        System.out.println(user);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        CheckForDuplicatesExample check = new CheckForDuplicatesExample();
        try {
            String errorM = check.checkAll(user.getUsername(),user.getTelephone(),user.getEmail());
            if (errorM != null) {
                System.out.println(errorM);
                response.setStatus(409);
                Gson gson = new Gson();
                JsonObject jo = new JsonObject();
                jo.addProperty("error",errorM);
                response.getWriter().write(jo.toString());
            } else {
                jc.addNewUser(user);
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