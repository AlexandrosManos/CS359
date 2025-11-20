/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import database.DB_Connection;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import mainClasses.Incident;
import mainClasses.Message;

/**
 *
 * @author mountant
 */
public class EditMessagesTable {

    public void addMessageFromJSON(String json) throws ClassNotFoundException {
        Message msg = jsonToMessage(json);
        System.out.println(msg);
        createNewMessage(msg);
    }

    public Message jsonToMessage(String json) {
        Gson gson = new Gson();
        Message msg = gson.fromJson(json, Message.class);
        msg.setDate_time();
        return msg;
    }

    public String messageToJSON(Message msg) {
        Gson gson = new Gson();

        String json = gson.toJson(msg, Message.class);
        return json;
    }

    public String messagesToJSON(ArrayList<Message> messages) {
        Gson gson = new Gson();
        return gson.toJson(messages);
    }
    public void updateMessage(String id,String key,String value) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String update="UPDATE messages SET " + key + "='" + value + "'" + "WHERE message_id = '" + id + "'";
        stmt.executeUpdate(update);
        stmt.close();
        con.close();
    }

    public ArrayList<Message> databaseToMessages() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Message> messages = new ArrayList<Message>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM messages");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Message msg = gson.fromJson(json, Message.class);
                messages.add(msg);
            }
            return messages;
        } catch (Exception e) {
            System.err.println("Got an exception! ");

        }
        return null;
    }

    public ArrayList<Message> databaseToMessages(int incident_id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Message> messages = new ArrayList<Message>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM messages WHERE incident_id= '" + incident_id + "' AND recipient = 'public'");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Message msg = gson.fromJson(json, Message.class);
                messages.add(msg);
            }
            return messages;
        } catch (Exception e) {
            System.err.println("Got an exception! ");

        }
        return null;
    }
    public ArrayList<Message> adminChatLog(String user) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Message> messages = new ArrayList<Message>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM messages WHERE (sender = '" + user + "' AND recipient = 'admin') OR (sender = 'admin' AND recipient = '" + user + "')");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Message msg = gson.fromJson(json, Message.class);
                messages.add(msg);
            }
            return messages;
        } catch (Exception e) {
            System.err.println("Got an exception! ");

        }
        return null;
    }


    public ArrayList<Message> databaseToMessages(int incident_id, String userName) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Message> messages = new ArrayList<Message>();
        ResultSet rs;
        try {
            String query = "SELECT m.* FROM messages m " +
                    "JOIN participants p " +
                    "ON m.incident_id = p.incident_id " +
                    "AND m.recipient = 'volunteers' " +
                    "AND p.volunteer_username = '" + userName + "' " +
                    "AND p.status = 'accepted' " +
                    "WHERE m.incident_id = '" + incident_id + "'";

            rs = stmt.executeQuery(query);
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Message msg = gson.fromJson(json, Message.class);
                messages.add(msg);
            }
            return messages;
        } catch (Exception e) {
            System.err.println("Got an exception! ");

        }
        return null;
    }

    public Message databaseToMessage(int message_id) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM messages WHERE message_id = '" + message_id +"'");
            rs.next();
            String json=DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            return gson.fromJson(json, Message.class);
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }


    public void createMessageTable() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String sql = "CREATE TABLE messages "
                + "(message_id INTEGER not NULL AUTO_INCREMENT, "
                + "incident_id INTEGER not NULL, "
                + "message VARCHAR(400) not NULL, "
                + "sender VARCHAR(50) not NULL, "
                + "recipient VARCHAR(50) not NULL, "
                + "date_time DATETIME  not NULL,"
                + "FOREIGN KEY (incident_id) REFERENCES incidents(incident_id), "
                + "PRIMARY KEY ( message_id ))";
        
        stmt.execute(sql);
        stmt.close();
        con.close();

    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void createNewMessage(Message msg) throws ClassNotFoundException {
        try {
            Connection con = DB_Connection.getConnection();

            Statement stmt = con.createStatement();

            String insertQuery = "INSERT INTO "
                    + " messages (incident_id,message,sender,recipient,date_time) "
                    + " VALUES ("
                    + "'" + msg.getIncident_id() + "',"
                    + "'" + msg.getMessage() + "',"
                    + "'" + msg.getSender() + "',"
                    + "'" + msg.getRecipient() + "',"
                    + "'" + msg.getDate_time() + "'"
                    + ")";
            //stmt.execute(table);
            System.out.println(insertQuery);
            stmt.executeUpdate(insertQuery);
            System.out.println("# The message was successfully added in the database.");

            /* Get the member id from the database and set it to the member */
            stmt.close();

        } catch (SQLException ex) {
            Logger.getLogger(EditMessagesTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public String LastMessageDate(int incident_id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs;
        String Date="";

        try {
            rs = stmt.executeQuery("SELECT date_time FROM messages WHERE incident_id = '" + incident_id + "' ORDER BY date_time DESC LIMIT 1");
            while (rs.next()) {
                Date = rs.getString("date_time");
            }
            return Date;
        } catch (Exception e) {
            System.err.println("Got an exception! ");

        }
        return null;
    }


}
