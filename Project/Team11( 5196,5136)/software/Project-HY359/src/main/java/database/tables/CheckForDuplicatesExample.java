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
import mainClasses.User;

/**
 *
 * @author micha
 */
public class CheckForDuplicatesExample {
    public String telMess = "There is already an account with this telephone";
    public String usernameMess = "Username is already taken";

    public String emailMess = "There is already an account with this email";
    public String checkAll(String username,String telephone, String email ) throws SQLException, ClassNotFoundException {
        if (!isUserNameAvailable(username))
            return usernameMess;
        else if (!isTelephoneAvailable(telephone)) {
            return telMess;
        } else if (!isEmailAvailable(email,username)) {
            return emailMess;
        }

        return null;
    }

    public boolean isUserNameAvailable(String username) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT COUNT(username) AS total FROM users WHERE username = '" + username + "'");
            rs.next();
            if(rs.getInt("total")==0){
                rs = stmt.executeQuery("SELECT COUNT(username) AS total2 FROM volunteers WHERE username = '" + username + "'");
                rs.next();
                if(rs.getInt("total2")==0){
                    return true;
                }
            }
            return false;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return false;
    }
    public boolean isTelephoneAvailable(String telephone) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT COUNT(telephone) AS total FROM users WHERE telephone = '" + telephone
                    + "'");
            rs.next();
            if(rs.getInt("total")==0){
                rs = stmt.executeQuery("SELECT COUNT(telephone) AS total2 FROM volunteers WHERE telephone = '" + telephone
                        + "'");
                rs.next();
                if(rs.getInt("total2")==0){
                    return true;
                }
            }
            return false;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return false;
    }

    public boolean isEmailAvailable(String email,String username) throws SQLException, ClassNotFoundException{
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT COUNT(email) AS total FROM users WHERE email = '" + email +
                    "' AND username != '" + username + "'");
            rs.next();
            if(rs.getInt("total")==0){
                rs = stmt.executeQuery("SELECT COUNT(email) AS total2 FROM volunteers WHERE email = '" + email +
                        "' AND username != '" + username + "'");
                rs.next();
                if(rs.getInt("total2")==0){
                    return true;
                }
            }
            return false;

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return false;
    }
    
    
}
