package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "Users")
public class User implements Serializable {
	private static final long serialVersionUID = 1L;

	@NotBlank
	@Column(name = "firstName", updatable = true)
	private String firstName;

	@NotBlank
	@Column(name = "lastName", updatable = true)
	private String lastName;

	@NotBlank
	@Column(name = "password", updatable = true)
	private String password;

	@Id
	@Column(name = "email", updatable = false)
	private String email;

	@Column(name = "workplace", updatable = true)
	@NotBlank
	private String workplace;

	@Column(name = "nickname", updatable = true)
	private String nickname;// alcunha - é opcional o user colocar ou não

	@Column(name = "photo", updatable = true, length=1000000000)
	private String photo;// opcional

	@Column(name = "biography", updatable = true, length = 10000000)
	private String biography;// opcional

	@Column(name = "availability", updatable = true)
	private String availability;// opcional

	@Column(name = "token", updatable = true)
	private String temporaryToken;

	@Enumerated(EnumType.STRING)
	@Column(name = "typeUser", updatable = true)
	private UserType typeUser;

	@Enumerated(EnumType.STRING)
	@Column(name = "visilibityUser", updatable = true)
	private VisibilityUser visilibityUser;

	// lista de comentários que o user fez
	@OneToMany(mappedBy = "commentOwner")
	private Collection<Comment> userCommentList;

	// lista de ideias/necessidades que o user fez
	@OneToMany(mappedBy = "owner")
	private Collection<Forum> userForumList;

	// lista de projetos que o user fez
	@OneToMany(mappedBy = "ownerProj")
	private Collection<Project> userProjectList;

	// lista de notificações que o user tem
	@OneToMany(mappedBy = "ownerNot")
	private Collection<Notification> userNotificationList;

	// lista de mensagens que o user recebeu
	@OneToMany(mappedBy = "receiver")
	private Collection<Message> receivedMessageList;

	// lista de mensagens que o user enviou
	@OneToMany(mappedBy = "sender")
	private Collection<Message> sentMessageList;

	// lista de projetos em que o user é membro
	@OneToMany(mappedBy = "user")
	private Collection<Member> integratedProjectList;

	// lista de skills que este user tem
	@ManyToMany(mappedBy = "usersWhoHaveThisSkill")
	private Collection<Skill> userSkillList;

	// lista de interesses que este user tem
	@ManyToMany(mappedBy = "usersWhoHaveThisInterest")
	private Collection<Interest> userInterestList;

	// lista de utilizadores que, caso o user tenha a visibilidade específica, têm
	// autorização para ver a sua área pessoal
	@ManyToMany // (fetch=FetchType.EAGER)
	private List<User> usersWhoCanView;

	// lista de forums que o user deu favorito
	@ManyToMany(mappedBy = "usersWhoFavorited")
	private Collection<Forum> favoritedForums;

	// lista de forums que o user tem interesse em trabalhar
	@ManyToMany(mappedBy = "usersWhoHaveInterest")
	private Collection<Forum> forumsUserWishesToWorkIn;

	// lista de forums em que o user votou
	@ManyToMany(mappedBy = "usersWhoHaveVoted")
	private Collection<Forum> forumsUserHasVotedIn;

	// lista de projetos que o user deu favorito
	@ManyToMany(mappedBy = "usersWhoHaveFavorited")
	private Collection<Project> favoritedProjects;

	// lista de projetos que o user votou
	@ManyToMany(mappedBy = "usersWhoHaveVoted")
	private Collection<Project> projectsUserHasVotedIn;

	public enum VisibilityUser {
		PUBLIC, PRIVATE, ESPECIFIC
	}

	public enum UserType {
		VISITOR, ADMINISTRATOR, STANDARD, UNNAUTHENTICATED
	}

	public User() {

	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getWorkplace() {
		return workplace;
	}

	public void setWorkplace(String workplace) {
		this.workplace = workplace;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public String getBiography() {
		return biography;
	}

	public void setBiography(String biography) {
		this.biography = biography;
	}

	public String getAvailability() {
		return availability;
	}

	public void setAvailability(String availability) {
		this.availability = availability;
	}

	public UserType getTypeUser() {
		return typeUser;
	}

	public void setTypeUser(UserType typeUser) {
		this.typeUser = typeUser;
	}

	public VisibilityUser getVisilibityUser() {
		return visilibityUser;
	}

	public void setVisilibityUser(VisibilityUser visilibityUser) {
		this.visilibityUser = visilibityUser;
	}

	public Collection<Comment> getUserCommentList() {
		return userCommentList;
	}

	public void setUserCommentList(Collection<Comment> userCommentList) {
		this.userCommentList = userCommentList;
	}

	public Collection<Forum> getUserForumList() {
		return userForumList;
	}

	public void setUserForumList(Collection<Forum> userForumList) {
		this.userForumList = userForumList;
	}

	public Collection<Project> getUserProjectList() {
		return userProjectList;
	}

	public void setUserProjectList(Collection<Project> userProjectList) {
		this.userProjectList = userProjectList;
	}

	public Collection<Notification> getUserNotificationList() {
		return userNotificationList;
	}

	public void setUserNotificationList(Collection<Notification> userNotificationList) {
		this.userNotificationList = userNotificationList;
	}

	public Collection<Message> getReceivedMessageList() {
		return receivedMessageList;
	}

	public void setReceivedMessageList(Collection<Message> receivedMessageList) {
		this.receivedMessageList = receivedMessageList;
	}

	public Collection<Message> getSentMessageList() {
		return sentMessageList;
	}

	public void setSentMessageList(Collection<Message> sentMessageList) {
		this.sentMessageList = sentMessageList;
	}

	public Collection<Member> getIntegratedProjectList() {
		return integratedProjectList;
	}

	public void setIntegratedProjectList(Collection<Member> integratedProjectList) {
		this.integratedProjectList = integratedProjectList;
	}

	public Collection<Skill> getUserSkillList() {
		return userSkillList;
	}

	public void setUserSkillList(Collection<Skill> userSkillList) {
		this.userSkillList = userSkillList;
	}

	public Collection<Interest> getUserInterestList() {
		return userInterestList;
	}

	public void setUserInterestList(Collection<Interest> userInterestList) {
		this.userInterestList = userInterestList;
	}

	public List<User> getUsersWhoCanView() {
		return usersWhoCanView;
	}

	public void setUsersWhoCanView(List<User> usersWhoCanView) {
		this.usersWhoCanView = usersWhoCanView;
	}

	public Collection<Forum> getFavoritedForums() {
		return favoritedForums;
	}

	public void setFavoritedForums(Collection<Forum> favoritedForums) {
		this.favoritedForums = favoritedForums;
	}

	public Collection<Forum> getForumsUserWishesToWorkIn() {
		return forumsUserWishesToWorkIn;
	}

	public void setForumsUserWishesToWorkIn(Collection<Forum> forumsUserWishesToWorkIn) {
		this.forumsUserWishesToWorkIn = forumsUserWishesToWorkIn;
	}

	public Collection<Forum> getForumsUserHasVotedIn() {
		return forumsUserHasVotedIn;
	}

	public void setForumsUserHasVotedIn(Collection<Forum> forumsUserHasVotedIn) {
		this.forumsUserHasVotedIn = forumsUserHasVotedIn;
	}

	public Collection<Project> getFavoritedProjects() {
		return favoritedProjects;
	}

	public void setFavoritedProjects(Collection<Project> favoritedProjects) {
		this.favoritedProjects = favoritedProjects;
	}

	public Collection<Project> getProjectsUserHasVotedIn() {
		return projectsUserHasVotedIn;
	}

	public void setProjectsUserHasVotedIn(Collection<Project> projectsUserHasVotedIn) {
		this.projectsUserHasVotedIn = projectsUserHasVotedIn;
	}

	public String getTemporaryToken() {
		return temporaryToken;
	}

	public void setTemporaryToken(String temporaryToken) {
		this.temporaryToken = temporaryToken;
	}

	@Override
	public String toString() {
		return "User [firstName=" + firstName + ", lastName=" + lastName + ", email=" + email + ", workplace="
				+ workplace + "]";
	}



}
