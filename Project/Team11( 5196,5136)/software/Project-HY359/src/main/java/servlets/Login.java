package servlets;

import database.tables.EditUsersTable;
import database.tables.EditVolunteersTable;
import mainClasses.User;
import mainClasses.Volunteer;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;



@WebServlet(name = "Login", value = "/Login")
public class Login extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
    }

    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        HttpSession session = request.getSession();
        String loggedInUsername = (String) session.getAttribute("loggedIn");
        if(loggedInUsername!=null){
            try (PrintWriter out = response.getWriter()) {
                EditUsersTable eut = new EditUsersTable();
                User su = eut.databaseToUsers(loggedInUsername);
                if (su == null) {
                    // Volunteer is online
                    EditVolunteersTable evt = new EditVolunteersTable();
                    Volunteer sv = evt.databaseToVolunteer(loggedInUsername);
                    if (sv == null)
                        response.setStatus(403);
                    String json = evt.volunteerToJSON(sv);
                    out.println(json);
                    response.setStatus(200);
                } else {
                    // User is online
                   String json = eut.userToJSON(su);
                    out.println(json);
                    response.setStatus(200);
                }
            } catch (SQLException | ClassNotFoundException ex) {
               Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
            }
        } else{
            response.setStatus(403);
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username=request.getParameter("username");
        String password=request.getParameter("password");

        HttpSession session=request.getSession();

        System.out.println("username:"+username + " password:"+password);

        try (PrintWriter out = response.getWriter()) {
            EditUsersTable eut = new EditUsersTable();
            User su = eut.databaseToUsers(username, password);
            EditVolunteersTable evt = new EditVolunteersTable();
            Volunteer sv = evt.databaseToVolunteer(username, password);
            if (su != null){
                // User logged in
                session.setAttribute("loggedIn",username);
                String json = eut.userToJSON(su);
                out.println(json);
                response.setStatus(200);
            } else if (sv != null ) {
                // Volunteer logged in
                session.setAttribute("loggedIn",username);
                String json = evt.volunteerToJSON(sv);
                out.println(json);
                response.setStatus(200);
            }else {
                response.setStatus(403);
            }
        } catch (SQLException | ClassNotFoundException ex) {
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

}