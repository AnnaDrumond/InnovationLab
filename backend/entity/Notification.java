package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Notifications")
public class Notification implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	// n1 pedir para participar num projeto
	// n2 convidar para constituir membro do projeto
	public enum NotificationType {
		REQUEST, INVITE, ACCEPTED;
	}

	@Enumerated(EnumType.STRING)
	@Column(name = "typeNotification", updatable = true)
	private NotificationType typeNotification;
	
	@CreationTimestamp
	@Column(name = "creationDate", nullable = false, updatable = false, insertable = false, columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP")
	private Timestamp creationDate;

	@Column(name = "text", length=1000000)
	@NotBlank
	private String text;

	@Column(name = "seen")
	private boolean seen;
	
	//id do projeto a que se refere a notificacao
	@Column(name = "idProject")
	private int idProject;
	
	//email do user a quem se destina a notificacao
	@Column(name="userReferenced")
	private String userReferenced;
	

	// utilizador para quem vai a notificação
	@ManyToOne
	private User ownerNot;
	
	// private String email - seria do user que originou a not
	

	public Notification() {

	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
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

	public User getOwnerNot() {
		return ownerNot;
	}

	public void setOwnerNot(User ownerNot) {
		this.ownerNot = ownerNot;
	}

	public Timestamp getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Timestamp creationDate) {
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
