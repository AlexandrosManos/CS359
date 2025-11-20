package servlets;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.init.JSON_Converter;
import database.tables.EditIncidentsTable;
import database.tables.EditMessagesTable;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "NewMessage", value = "/NewMessage")
public class NewMessage extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        JSON_Converter jc  = new JSON_Converter();


        String new_message = jc.getJSONFromAjax(request.getReader());
        System.out.println("NewMessage: "+new_message);



        try{
            EditMessagesTable newMess = new EditMessagesTable();

            newMess.addMessageFromJSON(new_message);


            response.setContentType("application/json");
            response.setStatus(200);

        }catch ( ClassNotFoundException ex){
            Logger.getLogger(GetUser.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}