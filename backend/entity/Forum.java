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
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Forum")
public class Forum implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@Column(name = "description", length=1000000000)
	@NotBlank
	private String description;
	
	@Column(name = "title", length=10000)
	@NotBlank
	private String title;

	public enum ForumType {
		NECESSITY, IDEA;
	}
	
	@Column(name = "softDelete")
	private boolean softDelete;

	@Enumerated(EnumType.STRING)
	@Column(name = "forumType", updatable = true)
	private ForumType forumType;

	@CreationTimestamp
	@Column(name = "creationDate", nullable = false, updatable = false, insertable = false, columnDefinition = "TIMESTAMP default CURRENT_TIMESTAMP")
	private Timestamp creationDate;

	//@UpdateTimestamp
	//@Column(name = "lastUpdate", nullable = false, updatable = true, insertable = false, columnDefinition = "TIMESTAMP default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP")
	private Timestamp lastUpdate;

	// ligação de associação entre forums - necessário fazer porque esta ligação
	// pode ter uma descrição que as une
	@OneToMany(mappedBy = "associatedForum")
	private Collection<Association> forumAssociated;

	// ligação de associação entre forums - necessário fazer porque esta ligação
	// pode ter uma descrição que as une
	@OneToMany(mappedBy = "forumToAssociate")
	private Collection<Association> forumToAssociate;

	// lista de comentários da ideia/necessidade
	@OneToMany(mappedBy = "forumWhereCommented")
	private Collection<Comment> forumCommentList;

	// utilizador que criou a ideia/necessidade
	@ManyToOne
	private User owner;

	// lista de projetos associados àquela ideia/necessidade
	@ManyToMany(mappedBy = "forumAssociatedWithThisProject")
	private Collection<Project> projectsAssociatedWithForum;

	// lista de interesses associados àquela ideia/necessidade
	@ManyToMany(mappedBy = "forumThatHaveThisInterest")
	private Collection<Interest> interestsAssociatedWithForum;

	// lista de skills associados àquela ideia/necessidade
	@ManyToMany(mappedBy = "forumThatHaveThisSkill")
	private Collection<Skill> skillsAssociatedWithForum;

	// lista de users que favoritaram este forum
	@ManyToMany
	@JoinTable(name = "Favorited_Forums") // nome da tabela que une forum e user
	private Collection<User> usersWhoFavorited;

	// lista de users com interesse em trabalhar neste forum
	@ManyToMany
	@JoinTable(name = "Wish_to_work_Forum") // nome da tabela que une forum e user
	private Collection<User> usersWhoHaveInterest;

	// lista de users que votaram neste forum
	@ManyToMany
	@JoinTable(name = "Voted_Forum") // nome da tabela que une forum e user
	private Collection<User> usersWhoHaveVoted;

	public Forum() {

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

	public ForumType getForumType() {
		return forumType;
	}

	public void setForumType(ForumType forumType) {
		this.forumType = forumType;
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

	public Collection<Association> getForumAssociated() {
		return forumAssociated;
	}

	public void setForumAssociated(Collection<Association> forumAssociated) {
		this.forumAssociated = forumAssociated;
	}

	public Collection<Association> getForumToAssociate() {
		return forumToAssociate;
	}

	public void setForumToAssociate(Collection<Association> forumToAssociate) {
		this.forumToAssociate = forumToAssociate;
	}

	public Collection<Comment> getForumCommentList() {
		return forumCommentList;
	}

	public void setForumCommentList(Collection<Comment> forumCommentList) {
		this.forumCommentList = forumCommentList;
	}

	public User getOwner() {
		return owner;
	}

	public void setOwner(User owner) {
		this.owner = owner;
	}

	public Collection<Project> getProjectsAssociatedWithForum() {
		return projectsAssociatedWithForum;
	}

	public void setProjectsAssociatedWithForum(Collection<Project> projectsAssociatedWithForum) {
		this.projectsAssociatedWithForum = projectsAssociatedWithForum;
	}

	public Collection<Interest> getInterestsAssociatedWithForum() {
		return interestsAssociatedWithForum;
	}

	public void setInterestsAssociatedWithForum(Collection<Interest> interestsAssociatedWithForum) {
		this.interestsAssociatedWithForum = interestsAssociatedWithForum;
	}

	public Collection<Skill> getSkillsAssociatedWithForum() {
		return skillsAssociatedWithForum;
	}

	public void setSkillsAssociatedWithForum(Collection<Skill> skillsAssociatedWithForum) {
		this.skillsAssociatedWithForum = skillsAssociatedWithForum;
	}

	public Collection<User> getUsersWhoFavorited() {
		return usersWhoFavorited;
	}

	public void setUsersWhoFavorited(Collection<User> usersWhoFavorited) {
		this.usersWhoFavorited = usersWhoFavorited;
	}

	public Collection<User> getUsersWhoHaveInterest() {
		return usersWhoHaveInterest;
	}

	public void setUsersWhoHaveInterest(Collection<User> usersWhoHaveInterest) {
		this.usersWhoHaveInterest = usersWhoHaveInterest;
	}

	public Collection<User> getUsersWhoHaveVoted() {
		return usersWhoHaveVoted;
	}

	public void setUsersWhoHaveVoted(Collection<User> usersWhoHaveVoted) {
		this.usersWhoHaveVoted = usersWhoHaveVoted;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public boolean isSoftDelete() {
		return softDelete;
	}

	public void setSoftDelete(boolean softDelete) {
		this.softDelete = softDelete;
	}

	@Override
	public String toString() {
		return "Forum [id=" + id + ", title=" + title + "]";
	}
	
	

}
