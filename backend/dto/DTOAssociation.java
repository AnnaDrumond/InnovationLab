package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;


@XmlRootElement
public class DTOAssociation implements Serializable {
	private static final long serialVersionUID = 1L;

	private int id;
	private String description;
	private DTOForum associatedForum;
	
	public DTOAssociation() {
		
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public DTOForum getAssociatedForum() {
		return associatedForum;
	}

	public void setAssociatedForum(DTOForum associatedForum) {
		this.associatedForum = associatedForum;
	}		
}
