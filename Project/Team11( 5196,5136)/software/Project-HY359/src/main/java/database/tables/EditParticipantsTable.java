/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import mainClasses.Participant;
import database.DB_Connection;
import mainClasses.User;

import java.io.BufferedReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Mike
 */
public class EditParticipantsTable {

    public void addParticipantFromJSON(String json) throws ClassNotFoundException {
        Participant r = jsonToParticipant(json);
        createNewParticipant(r);
    }
    public Participant jsonToParticipant(BufferedReader json){
        Gson gson = new Gson();
        Participant msg = gson.fromJson(json, Participant.class);
        return msg;
    }
    public Participant databaseToParticipant(int id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM participants WHERE participant_id= '" + id + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            Participant bt = gson.fromJson(json, Participant.class);
            return bt;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
    public ArrayList<Participant> databaseToParticipant() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Participant> prts = new ArrayList<Participant>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM participants");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Participant ptr = gson.fromJson(json, Participant.class);
                prts.add(ptr);
            }
            return prts;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public Participant jsonToParticipant(String json) {
        Gson gson = new Gson();
        Participant r = gson.fromJson(json, Participant.class);
        return r;
    }

    public String participantToJSON(Participant r) {
        Gson gson = new Gson();

        String json = gson.toJson(r, Participant.class);
        return json;
    }

    public String participantsToJSON(ArrayList<Participant> ptrs){
        Gson gson = new Gson();
        return gson.toJson(ptrs);
    }
    public void acceptParticipant(int participantID, String volunteer_username) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String updateQuery = "UPDATE participants SET volunteer_username='" + volunteer_username + "', status='accepted' WHERE participant_id= '" + participantID + "'";
        stmt.executeUpdate(updateQuery);
        stmt.close();
        con.close();
    }
    
       public void finalStatusParticipant(int participantID, String success, String comment) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String updateQuery = "UPDATE participants SET status='finished', success='" + success + "', comment='"+
                comment+"' WHERE participant_id= '" + participantID + "'";
        stmt.executeUpdate(updateQuery);
        stmt.close();
        con.close();
    }

    public void createParticipantTable() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String sql = "CREATE TABLE participants "
                + "(participant_id INTEGER not NULL AUTO_INCREMENT, "
                + " incident_id INTEGER not NULL, "
                + " volunteer_username VARCHAR(30), "
                + " volunteer_type VARCHAR(10) not null, "
                + " status VARCHAR(15) not null, "
                + " success VARCHAR(10), "
                + " comment VARCHAR(300), "
                + "FOREIGN KEY (incident_id) REFERENCES incidents(incident_id), "
                + " PRIMARY KEY (participant_id ))";
        stmt.execute(sql);
        stmt.close();
        con.close();

    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void createNewParticipant(Participant par) throws ClassNotFoundException {
        try {
            Connection con = DB_Connection.getConnection();

            Statement stmt = con.createStatement();

            String insertQuery = "INSERT INTO "
                    + " participants (incident_id,volunteer_username,"
                    + "volunteer_type,status,success,comment)"
                    + " VALUES ("
                    + "'" + par.getIncident_id() + "',"
                    + "'" + par.getVolunteer_username()+ "',"
                    + "'" + par.getVolunteer_type() + "',"
                    + "'" + par.getStatus() + "',"
                    + "'" + par.getSuccess() + "',"
                    + "'" + par.getComment() + "'"
                    + ")";
            //stmt.execute(table);

            stmt.executeUpdate(insertQuery);
            System.out.println("# The participant was successfully added in the database.");

            /* Get the member id from the database and set it to the member */
            stmt.close();

        } catch (SQLException ex) {
            Logger.getLogger(EditParticipantsTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void updateParticipant(String id,String key,String value) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String update="UPDATE participants SET " + key + "='" + value + "'" + "WHERE participant_id = '" + id + "'";
        stmt.executeUpdate(update);
        stmt.close();
        con.close();
    }

    public String getStatus(int incident_id, String volunteer_username) throws SQLException, ClassNotFoundException {

        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            String query = "SELECT status FROM participants WHERE incident_id= '" + incident_id
                    +"' AND volunteer_username='" + volunteer_username + "'";
            rs = stmt.executeQuery(query);
            if (!rs.next()) {
                return null;
            }
            String Status = rs.getString("status");
            stmt.close();
            con.close();
            return Status;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
    public String getHistory(String volunteer_username) throws SQLException, ClassNotFoundException {

        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            String query =  "SELECT incidents.incident_type, incidents.description, incidents.address, incidents.municipality, " +
                                "participants.status, participants.success, participants.comment " +
                                "FROM incidents " +
                                "INNER JOIN participants ON incidents.incident_id = participants.incident_id " +
                                "WHERE participants.volunteer_username = '" + volunteer_username + "'";
            rs = stmt.executeQuery(query);
            if (!rs.next()) {
                return null;
            }

            String incidentType = rs.getString("incident_type");
            String description = rs.getString("description");
            String address = rs.getString("address");
            String municipality = rs.getString("municipality");
            String status = rs.getString("status");
            String success = rs.getString("success");
            String comment = rs.getString("comment");

            // org.json didn't work :_)
            String json = "{";
            json += "\"incident_type\": \"" + incidentType + "\", ";
            json += "\"description\": \"" + description + "\", ";
            json += "\"address\": \"" + address + "\", ";
            json += "\"municipality\": \"" + municipality + "\", ";
            json += "\"status\": \"" + status + "\", ";
            json += "\"success\": \"" + success + "\", ";
            json += "\"comment\": \"" + comment + "\"";
            json += "}";

            stmt.close();
            con.close();
            return json;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
}
