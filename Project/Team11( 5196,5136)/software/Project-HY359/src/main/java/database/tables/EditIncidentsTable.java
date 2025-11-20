/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import mainClasses.Incident;
import com.google.gson.Gson;
import database.DB_Connection;
import mainClasses.User;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Mike
 */
public class EditIncidentsTable {

    public void addIncidentFromJSON(String json) throws ClassNotFoundException {
        Incident bt = jsonToIncident(json);
        if (bt.getStart_datetime()==null){
            bt.setStart_datetime();
        }
        createNewIncident(bt);
    }

    public Incident jsonToIncident(String json) {
        Gson gson = new Gson();
        Incident btest = gson.fromJson(json, Incident.class);
        return btest;
    }

    public String incidentToJSON(Incident bt) {
        Gson gson = new Gson();

        String json = gson.toJson(bt, Incident.class);
        return json;
    }

    public ArrayList<Incident> databaseToIncidents() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }
            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }


    public Incident databaseToIncident (int incident_id) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE incident_id = '" + incident_id +"'");
            rs.next();
            String json=DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            Incident incident = gson.fromJson(json, Incident.class);
            return incident;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<Incident> databaseToIncidentsSearch(String type,String status,String municipality) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> incidents = new ArrayList<Incident>();
        ResultSet rs;
        String where="WHERE";
        if(!type.equals("all"))
            where+=" incident_type='" + type + "'";
        if(!status.equals("all")){
            if(!where.equals("WHERE")){
                where+=" and status='" + status + "'";
            }
            else{
                where+=" status='" + status + "'";
            }
        }
        if(!municipality.equals("all") && !municipality.equals("")){
            if(!where.equals("WHERE")){
                where+=" and municipality='" + municipality + "'";
            }
            else{
                where+=" municipality='" + municipality + "'";
            }
        }
        try {
            String query="SELECT * FROM incidents ";
            if(!where.equals("WHERE"))
                query+=where;
            System.out.println(query);
            rs = stmt.executeQuery(query);

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident incident = gson.fromJson(json, Incident.class);
                incidents.add(incident);
            }
            return incidents;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
    public ArrayList<Incident> databaseToIncidentsSearch(String type) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE status!='fake' AND incident_type='" + type + "'");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }

            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public void updateIncident(String id, HashMap<String, String> updates) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        Incident bt = new Incident();
        for (String key : updates.keySet()) {
            String update = "UPDATE incidents SET " + key + "='" + updates.get(key) + "'" + "WHERE incident_id = '" + id + "'";
            stmt.executeUpdate(update);
        }
        stmt.close();
        con.close();
    }
    public void updateIncident(String id,String key,String value) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String update="UPDATE incidents SET " + key + "='" + value + "'" + "WHERE incident_id = '" + id + "'";
        stmt.executeUpdate(update);
        stmt.close();
        con.close();
    }
    public void deleteIncident(String id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String deleteQuery = "DELETE * FROM incidents WHERE incident_id='" + id + "'";
        stmt.executeUpdate(deleteQuery);
        stmt.close();
        con.close();
    }

    public void createIncidentsTable() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String sql = "CREATE TABLE incidents "
                + "(incident_id INTEGER not NULL AUTO_INCREMENT, "
                + "incident_type VARCHAR(10) not null,"
                + "description VARCHAR(100) not null,"
                + "user_phone VARCHAR(14) not null,"
                + "user_type VARCHAR(10)  not null, "
                + "address VARCHAR(100) not null,"
                + "lat DOUBLE, "
                + "lon DOUBLE, "
                + "municipality VARCHAR(50),"
                + "prefecture VARCHAR(15),"
                + "start_datetime DATETIME not null , "
                + "end_datetime DATETIME DEFAULT null, "
                + "danger VARCHAR (15), "
                + "status VARCHAR (15), "
                + "finalResult VARCHAR (200), "
                + "vehicles INTEGER, "
                + "firemen INTEGER, "
                + "PRIMARY KEY (incident_id ))";
        stmt.execute(sql);
        sql = "INSERT INTO incidents (incident_id, incident_type, description, user_phone, user_type, address, start_datetime)"
                +"VALUES (-1, 'Support', 'Admin Chat', '0', 'admin', '-', '2025-01-01 12:00:00')";
        stmt.execute(sql);
        stmt.close();
        con.close();
    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void createNewIncident(Incident bt) throws ClassNotFoundException {
        
        try {
            Connection con = DB_Connection.getConnection();

            Statement stmt = con.createStatement();

            String insertQuery = "INSERT INTO "
                    + " incidents (incident_id,incident_type,"
                    + "description,user_phone,user_type,"
                    + "address,lat,lon,municipality,prefecture,start_datetime,danger,status,"
                    + "finalResult,vehicles,firemen) "
                    + " VALUES ("
                    + "'" + bt.getIncident_id() + "',"
                    + "'" + bt.getIncident_type() + "',"
                    + "'" + bt.getDescription() + "',"
                    + "'" + bt.getUser_phone() + "',"
                    + "'" + bt.getUser_type() + "',"
                    + "'" + bt.getAddress() + "',"
                    + "'" + bt.getLat() + "',"
                    + "'" + bt.getLon() + "',"
                    + "'" + bt.getMunicipality() + "',"
                    + "'" + bt.getPrefecture() + "',"
                    + "'" + bt.getStart_datetime() + "',"
                    + "'" + bt.getDanger() + "',"
                    + "'" + bt.getStatus() + "',"
                    + "'" + bt.getFinalResult() + "',"
                    + "'" + bt.getVehicles() + "',"
                    + "'" + bt.getFiremen() + "'"
                    + ")";
            //stmt.execute(table);
            System.out.println(insertQuery);
            stmt.executeUpdate(insertQuery);
            System.out.println("# The incident was successfully added in the database.");

            /* Get the member id from the database and set it to the member */
            stmt.close();

        } catch (SQLException ex) {
            Logger.getLogger(EditIncidentsTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    public String incidentsToJSON(ArrayList<Incident> incidents) {
        Gson gson = new Gson();
        return gson.toJson(incidents);
    }
    public ArrayList<Incident> GetRunningIncidents() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE status='running'");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }

            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }
    public ArrayList<Incident> GetMyRunningIncidents(String userName) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            String query = "SELECT i.* " +
                    "FROM incidents i " +
                    "JOIN participants p ON i.incident_id = p.incident_id " +
                    "WHERE i.status = 'running' " +
                    "AND p.volunteer_username = '" + userName + "' " +
                    "AND p.status = 'accepted'";

            rs = stmt.executeQuery(query);
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }

            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<Incident> GetIncidentsNearby(String municipality) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<Incident> pets = new ArrayList<Incident>();
        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE status='running' AND municipality='" + municipality + "'");
            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                Incident pet = gson.fromJson(json, Incident.class);
                pets.add(pet);
            }

            return pets;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public Incident SearchIncident(String municipality,String incident_type,String start_datetime,String end_datetime,int firefightersCount,int vehiclesCount) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ResultSet rs;
        Incident incident;

        try{
            rs = stmt.executeQuery("SELECT * FROM incidents WHERE status='finished' " +
                            "AND municipality='" + municipality + "'" +
                            "AND incident_type='" + incident_type + "'" +
//                    "AND start_datetime='" + start_datetime + "'" +
//                    "AND end_datetime='" + end_datetime + "'" +
                            "AND firemen='" + firefightersCount + "'" +
                            "AND vehicles='" + vehiclesCount + "'"
            );

            if(rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                incident = gson.fromJson(json, Incident.class);

                return incident;
            }
        }catch (Exception e){
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }

        return null;
    }

}
