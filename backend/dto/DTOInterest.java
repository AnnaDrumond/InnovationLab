package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOInterest implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private String title;
	private int idInterest;
	
	public DTOInterest() {
		
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public int getIdInterest() {
		return idInterest;
	}

	public void setIdInterest(int idInterest) {
		this.idInterest = idInterest;
	}
	
	
	
}
