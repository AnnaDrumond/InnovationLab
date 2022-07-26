package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Collection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Skills")
public class Skill implements Serializable {
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

	public enum SkillType {
		KNOWLEDGE, SOFTWARE, HARDWARE, WORKINGTOOLS;
	}

	@Enumerated(EnumType.STRING)
	@Column(name = "skillType", updatable = true)
	private SkillType skillType;

	// lista de users que têm esta skill
	@ManyToMany
	private Collection<User> usersWhoHaveThisSkill;

	// lista de forum que têm esta skill
	@ManyToMany
	private Collection<Forum> forumThatHaveThisSkill;
	
	//lista de projetos que possui esta skill
	@ManyToMany
	private Collection<Project> projectsThatHaveThisSkill;

	public Skill() {

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

	public SkillType getSkillType() {
		return skillType;
	}

	public void setSkillType(SkillType skillType) {
		this.skillType = skillType;
	}

	public Collection<User> getUsersWhoHaveThisSkill() {
		return usersWhoHaveThisSkill;
	}

	public void setUsersWhoHaveThisSkill(Collection<User> usersWhoHaveThisSkill) {
		this.usersWhoHaveThisSkill = usersWhoHaveThisSkill;
	}

	public Collection<Forum> getForumThatHaveThisSkill() {
		return forumThatHaveThisSkill;
	}

	public void setForumThatHaveThisSkill(Collection<Forum> forumThatHaveThisSkill) {
		this.forumThatHaveThisSkill = forumThatHaveThisSkill;
	}

	public Collection<Project> getProjectsThatHaveThisSkill() {
		return projectsThatHaveThisSkill;
	}

	public void setProjectsThatHaveThisSkill(Collection<Project> projectsThatHaveThisSkill) {
		this.projectsThatHaveThisSkill = projectsThatHaveThisSkill;
	}


	
	

}
