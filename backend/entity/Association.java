package pt.uc.dei.projfinal.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "Associations")
public class Association implements Serializable {
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;
	
	@Column(name = "description", length=100000)
	//@NotBlank
	private String description;
	
	@ManyToOne
	private Forum associatedForum;
	
	@ManyToOne
	private Forum forumToAssociate;
	
	public Association() {
		
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

	public Forum getAssociatedForum() {
		return associatedForum;
	}

	public void setAssociatedForum(Forum associatedForum) {
		this.associatedForum = associatedForum;
	}

	public Forum getForumToAssociate() {
		return forumToAssociate;
	}

	public void setForumToAssociate(Forum forumToAssociate) {
		this.forumToAssociate = forumToAssociate;
	}

	@Override
	public String toString() {
		return "Association [id=" + id + ", description=" + description + "]";
	}



	
	
}
