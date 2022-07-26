package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Collection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "Projects")
public class Project implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@Column(name = "title", length=10000)
	@NotBlank
	private String title;

	//TODO METER LENGTH EM TODAS AS DESCRIPTIONS
	@Column(name = "description", length=1000000000)
	@NotBlank
	private String description;
	
	@Column(name = "softDelete")
	private boolean softDelete;

	@Column(name = "necessaryResources", length=10000000)
	private String necessaryResources;

	@Column(name = "executionPlan", length=10000000)
	private String executionPlan;
	
	@Column(name = "active")
	private boolean active;

	@CreationTimestamp
	@Column(name = "creationDate", nullable = false, updatable = false, insertable = false, columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP")
	private Timestamp creationDate;

	@UpdateTimestamp
	@Column(name = "lastUpdate", nullable = false, updatable = true, insertable = false, columnDefinition="TIMESTAMP default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP")
	private Timestamp lastUpdate;

	// lista de users em que constituem o projeto
	@OneToMany(mappedBy = "project")
	private Collection<Member> usersIntegratedList;

	// utilizador que criou o projeto
	@ManyToOne
	private User ownerProj;

	// lista de ideias/necessidades associadas a este projeto
	@ManyToMany
	private Collection<Forum> forumAssociatedWithThisProject;
	
	//lista de projetos que o user deu favorito
	@ManyToMany
	@JoinTable(name="Favorited_Project") //nome da tabela que une forum e user
	private Collection<User> usersWhoHaveFavorited;
	
	//lista de projetos que o user votou
	@ManyToMany
	@JoinTable(name="Voted_Project") //nome da tabela que une forum e user
	private Collection<User> usersWhoHaveVoted;
	
	//lista de skills associadas àquele projeto
	@ManyToMany(mappedBy="projectsThatHaveThisSkill")
	private Collection<Skill> skillsAssociatedWithProject;

	public Project() {

	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getNecessaryResources() {
		return necessaryResources;
	}

	public void setNecessaryResources(String necessaryResources) {
		this.necessaryResources = necessaryResources;
	}

	public String getExecutionPlan() {
		return executionPlan;
	}

	public void setExecutionPlan(String executionPlan) {
		this.executionPlan = executionPlan;
	}

	public Timestamp getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Timestamp creationDate) {
		this.creationDate = creationDate;
	}

	public Timestamp getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Timestamp lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	public Collection<Member> getUsersIntegratedList() {
		return usersIntegratedList;
	}

	public void setUsersIntegratedList(Collection<Member> usersIntegratedList) {
		this.usersIntegratedList = usersIntegratedList;
	}

	public User getOwnerProj() {
		return ownerProj;
	}

	public void setOwnerProj(User ownerProj) {
		this.ownerProj = ownerProj;
	}

	public Collection<Forum> getForumAssociatedWithThisProject() {
		return forumAssociatedWithThisProject;
	}

	public void setForumAssociatedWithThisProject(Collection<Forum> forumAssociatedWithThisProject) {
		this.forumAssociatedWithThisProject = forumAssociatedWithThisProject;
	}

	public Collection<User> getUsersWhoHaveFavorited() {
		return usersWhoHaveFavorited;
	}

	public void setUsersWhoHaveFavorited(Collection<User> usersWhoHaveFavorited) {
		this.usersWhoHaveFavorited = usersWhoHaveFavorited;
	}

	public Collection<User> getUsersWhoHaveVoted() {
		return usersWhoHaveVoted;
	}

	public void setUsersWhoHaveVoted(Collection<User> usersWhoHaveVoted) {
		this.usersWhoHaveVoted = usersWhoHaveVoted;
	}

	public Collection<Skill> getSkillsAssociatedWithProject() {
		return skillsAssociatedWithProject;
	}

	public void setSkillsAssociatedWithProject(Collection<Skill> skillsAssociatedWithProject) {
		this.skillsAssociatedWithProject = skillsAssociatedWithProject;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@Override
	public String toString() {
		return "Project [id=" + id + ", title=" + title + "]";
	}

	public boolean isSoftDelete() {
		return softDelete;
	}

	public void setSoftDelete(boolean softDelete) {
		this.softDelete = softDelete;
	}
	
	

}
