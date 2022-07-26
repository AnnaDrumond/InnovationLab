package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Collection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Interest")
public class Interest implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@CreationTimestamp
	@Column(name = "creationDate", nullable = false, updatable = false, insertable = false, columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP")
	private Timestamp creationDate;

	@Column(name = "title", unique=true, length=1000)
	@NotBlank
	private String title;

	// lista de users que têm este interesse
	@ManyToMany
	private Collection<User> usersWhoHaveThisInterest;

	// lista de forum que têm este interesse
	@ManyToMany
	private Collection<Forum> forumThatHaveThisInterest;

	public Interest() {

	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Timestamp getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Timestamp creationDate) {
		this.creationDate = creationDate;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Collection<User> getUsersWhoHaveThisInterest() {
		return usersWhoHaveThisInterest;
	}

	public void setUsersWhoHaveThisInterest(Collection<User> usersWhoHaveThisInterest) {
		this.usersWhoHaveThisInterest = usersWhoHaveThisInterest;
	}

	public Collection<Forum> getForumThatHaveThisInterest() {
		return forumThatHaveThisInterest;
	}

	public void setForumThatHaveThisInterest(Collection<Forum> forumThatHaveThisInterest) {
		this.forumThatHaveThisInterest = forumThatHaveThisInterest;
	}




	
	
	

}
