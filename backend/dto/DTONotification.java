package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

import pt.uc.dei.projfinal.entity.Notification.NotificationType;

@XmlRootElement
public class DTONotification implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private NotificationType typeNotification;
	private int id;
	private String text;
	private boolean seen;
	private String creationDate;
	private int idProject;
	private String userReferenced;
	
	public DTONotification() {
		
	}

	public NotificationType getTypeNotification() {
		return typeNotification;
	}

	public void setTypeNotification(NotificationType typeNotification) {
		this.typeNotification = typeNotification;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public boolean isSeen() {
		return seen;
	}

	public void setSeen(boolean seen) {
		this.seen = seen;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public int getIdProject() {
		return idProject;
	}

	public void setIdProject(int idProject) {
		this.idProject = idProject;
	}

	public String getUserReferenced() {
		return userReferenced;
	}

	public void setUserReferenced(String userReferenced) {
		this.userReferenced = userReferenced;
	}
	
	
	
	
}
