/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.init;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
/**
 *
 * @author micha
 */
public class JSON_Converter {
    	public String getJSONFromAjax(BufferedReader reader) throws IOException{
		StringBuilder buffer = new StringBuilder();
		String line;
		while ((line = reader.readLine()) != null) {
			buffer.append(line);
		}
		String data = buffer.toString();
		return data;
	}
	static public String ExtractType(BufferedReader rd){
		String jsonString = rd.lines().collect(Collectors.joining());
		JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();
		String UType = jsonObject.get("type").getAsString();
		System.out.println("Adding type: "+ UType);
		return UType;
	}

}
